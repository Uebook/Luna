<?php
require __DIR__ . '/config.php';

/* -------------- utils -------------- */
function logx($label, $data) {
  if (!WA_LOG_FILE) return;
  @file_put_contents(WA_LOG_FILE, '['.date('c')."] $label: ".(is_string($data)?$data:json_encode($data)).PHP_EOL, FILE_APPEND);
}

function wa_send_text($to, $text) {
  $url = WA_GRAPH_BASE . WA_PHONE_NUMBER_ID . '/messages';
  $payload = [
    'messaging_product' => 'whatsapp',
    'to'   => $to,        // E.164 without '+'
    'type' => 'text',
    'text' => ['body' => $text],
  ];
  $ch = curl_init($url);
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_HTTPHEADER     => [
      'Authorization: Bearer ' . WA_TOKEN,
      'Content-Type: application/json',
    ],
    CURLOPT_POSTFIELDS     => json_encode($payload, JSON_UNESCAPED_UNICODE),
    CURLOPT_TIMEOUT        => WA_TIMEOUT,
  ]);
  $res  = curl_exec($ch);
  $err  = curl_error($ch);
  $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  logx('SEND_TEXT_REQ', $payload);
  logx('SEND_TEXT_RES', ['code'=>$code,'res'=>$res,'err'=>$err]);
  // save outgoing
  $mysqli = db();
  $stmt = $mysqli->prepare("INSERT INTO messages (wa_id, direction, body) VALUES (?, 'out', ?)");
  $wa = $to; $b = $text;
  $stmt->bind_param('ss', $wa, $b); $stmt->execute();
  return $code === 200;
}

function upsert_lead($wa_id, $name) {
  $mysqli = db();
  // try fetch
  $stmt = $mysqli->prepare("SELECT id, step FROM leads WHERE wa_id=? LIMIT 1");
  $stmt->bind_param('s', $wa_id); $stmt->execute();
  $res = $stmt->get_result();
  if ($row = $res->fetch_assoc()) return $row; // already exists
  // create
  $stmt = $mysqli->prepare("INSERT INTO leads (wa_id, name, step) VALUES (?, ?, 0)");
  $stmt->bind_param('ss', $wa_id, $name);
  $stmt->execute();
  return ['id'=>$stmt->insert_id, 'step'=>0];
}

function save_answer($wa_id, $field, $value, $nextStep) {
  $mysqli = db();
  $sql = "UPDATE leads SET $field=?, step=? WHERE wa_id=?";
  $stmt = $mysqli->prepare($sql);
  $stmt->bind_param('sis', $value, $nextStep, $wa_id);
  $stmt->execute();
}

/* -------------- GET: verify webhook -------------- */
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $mode      = $_GET['hub_mode'] ?? '';
  $token     = $_GET['hub_verify_token'] ?? '';
  $challenge = $_GET['hub_challenge'] ?? '';
  if ($mode === 'subscribe' && $token === WA_VERIFY_TOKEN) {
    header('Content-Type: text/plain'); echo $challenge; exit;
  }
  http_response_code(403); echo 'Forbidden'; exit;
}

/* -------------- POST: incoming messages -------------- */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $raw = file_get_contents('php://input');
  $json = json_decode($raw, true);
  logx('INCOMING', $json);

  http_response_code(200); echo 'OK'; // ACK fast

  $value = $json['entry'][0]['changes'][0]['value'] ?? null;
  $msg   = $value['messages'][0] ?? null;
  if (!$msg) { logx('INFO','no message present'); exit; }

  $wa_id = $msg['from'] ?? '';
  $name  = $value['contacts'][0]['profile']['name'] ?? '';
  $type  = $msg['type'] ?? 'text';
  $body  = ($type === 'text') ? trim($msg['text']['body'] ?? '') : '';

  // save incoming
  $mysqli = db();
  $stmt = $mysqli->prepare("INSERT INTO messages (wa_id, direction, body) VALUES (?, 'in', ?)");
  $stmt->bind_param('ss', $wa_id, $body); $stmt->execute();

  $lead = upsert_lead($wa_id, $name);
  $step = (int)$lead['step'];

  // 365Neo services catalog (edit freely)
  $services = [
    "1) Mobile Apps (React Native: Android/iOS)",
    "2) Web Apps & Admin Panels (Laravel / Next.js)",
    "3) E-commerce (Grocery / Fashion / Multi-vendor)",
    "4) Live Classes & Video (Agora/Jitsi) + Recording",
    "5) WhatsApp Bots & CRM (Meta Cloud API)",
    "6) AI Integrations (RAG, Assistants, Voice)",
    "7) Logistics / Delivery / Booking Platforms",
  ];
  $servicesText = implode("\n", $services);

  // Conversation flow:
  // step 0 -> greeting + services + ask service
  // step 1 -> got service -> ask city
  // step 2 -> got city -> ask budget
  // step 3 -> got budget -> ask timeline
  // step 4 -> got timeline -> summary + mark completed (5)

  if ($step === 0) {
    $hi = $name ? "Hi $name 👋" : "Hi 👋";
    $txt = "$hi\nWelcome to 365Neo!\nHere are our services:\n$servicesText\n\nPlease reply with the **number** or type the service name.";
    wa_send_text($wa_id, $txt);
    save_answer($wa_id, 'step', 1, 1);
    exit;
  }

  if ($step === 1) {
    // Normalize service choice
    $choice = $body;
    if (preg_match('/^\d+$/', $body)) {
      $idx = max(1, min((int)$body, count($services)));
      $choice = preg_replace('/^\d+\)\s*/', '', $services[$idx-1]);
    }
    save_answer($wa_id, 'service', $choice, 2);
    wa_send_text($wa_id, "Great! 🧭 Which **city** are you in?");
    exit;
  }

  if ($step === 2) {
    save_answer($wa_id, 'city', $body, 3);
    wa_send_text($wa_id, "Noted. 💰 What’s your **budget range**? (e.g., 80k–1.2L)");
    exit;
  }

  if ($step === 3) {
    save_answer($wa_id, 'budget', $body, 4);
    wa_send_text($wa_id, "Thanks! ⏱️ What’s your **timeline** to start? (e.g., ASAP / 2–3 weeks / next month)");
    exit;
  }

  if ($step === 4) {
    save_answer($wa_id, 'timeline', $body, 5); // completed
    // Fetch final row to summarize
    $stmt = $mysqli->prepare("SELECT name, service, city, budget, timeline FROM leads WHERE wa_id=? LIMIT 1");
    $stmt->bind_param('s', $wa_id); $stmt->execute();
    $final = $stmt->get_result()->fetch_assoc();
    $nm = $final['name'] ?: 'there';
    $summary = "Thanks, $nm! ✅\nHere’s your enquiry:\n"
             . "• Service: {$final['service']}\n"
             . "• City: {$final['city']}\n"
             . "• Budget: {$final['budget']}\n"
             . "• Timeline: {$final['timeline']}\n\n"
             . "Our team at 365Neo will contact you shortly.\nYou can also share more details or documents here.";
    wa_send_text($wa_id, $summary);
    exit;
  }

  // If user types again after completion, resend services
  if ($step >= 5) {
    save_answer($wa_id, 'step', 1, 1);
    wa_send_text($wa_id, "You can start a new enquiry anytime.\nOur services:\n$servicesText\n\nReply with a number to proceed.");
    exit;
  }
}

/* Fallback */
http_response_code(405);
echo 'Method Not Allowed';
