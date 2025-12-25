<?php
/*  wa-log.php  — simple log viewer for WhatsApp webhook
 *  Place in:  public_html/wa/
 *  Secured by a query key: ?key=YOUR_SECRET
 */

$LOG_FILE = __DIR__ . '/whatsapp.log';   // adjust if needed
$SECRET   = 'neo-12345'; // <-- set your own secret

// ---------- auth ----------
$key = $_GET['key'] ?? '';
if ($key !== $SECRET) {
  http_response_code(403);
  header('Content-Type: text/plain; charset=utf-8');
  echo "Forbidden. Provide the correct ?key=SECRET";
  exit;
}

// ---------- params ----------
$lines  = max(1, min(5000, (int)($_GET['lines'] ?? 300))); // cap to 5k lines
$grep   = trim((string)($_GET['grep'] ?? ''));             // optional regex filter
$dl     = isset($_GET['download']);                        // download raw file
$auto   = isset($_GET['auto']);                            // auto refresh
$every  = max(3, min(120, (int)($_GET['every'] ?? 5)));    // seconds

// ---------- sanity ----------
if (!is_file($LOG_FILE)) {
  header('Content-Type: text/plain; charset=utf-8');
  echo "Log file not found:\n$LOG_FILE\n\nCreate it:\n$ touch " . $LOG_FILE . "\n$ chmod 664 " . $LOG_FILE . "\n";
  exit;
}

// ---------- download raw ----------
if ($dl) {
  header('Content-Type: text/plain; charset=utf-8');
  header('Content-Disposition: attachment; filename="whatsapp.log"');
  readfile($LOG_FILE);
  exit;
}

// ---------- tail function (efficient) ----------
function tail_lines($filepath, $lines = 300, $buffer = 4096) {
  $f = @fopen($filepath, "rb");
  if (!$f) return [];

  fseek($f, 0, SEEK_END);
  $pos   = ftell($f);
  $chunk = '';
  $out   = [];

  while ($pos > 0 && count($out) <= $lines) {
    $read = ($pos - $buffer > 0) ? $buffer : $pos;
    $pos -= $read;
    fseek($f, $pos);
    $chunk = fread($f, $read) . $chunk;
    // split and collect
    $rows = explode("\n", $chunk);
    // keep last partial line in chunk for next loop
    $chunk = array_shift($rows);
    // merge rows to output
    foreach (array_reverse($rows) as $row) {
      if ($row === '' && $pos === 0) continue;
      $out[] = $row;
      if (count($out) >= $lines) break;
    }
  }
  fclose($f);
  // reverse to normal order (oldest → newest)
  return array_reverse($out);
}

$all = tail_lines($LOG_FILE, $lines);

// ---------- optional filter (regex) ----------
$filtered = [];
if ($grep !== '') {
  $pattern = '/' . $grep . '/i';
  foreach ($all as $r) {
    if (@preg_match($pattern, $r)) $filtered[] = $r;
  }
} else {
  $filtered = $all;
}

// ---------- stats ----------
$size = filesize($LOG_FILE);
$mtime = date('Y-m-d H:i:s', filemtime($LOG_FILE));

?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>WA Log Viewer — whatsapp.log</title>
  <?php if ($auto): ?>
    <meta http-equiv="refresh" content="<?= htmlspecialchars($every) ?>">
  <?php endif; ?>
  <style>
    :root{ --bg:#0b1520; --ink:#e5eef7; --muted:#9fb3c8; --line:#243447; --chip:#163b2f; --chipText:#9fe3c6; }
    body{margin:0;padding:16px;background:var(--bg);color:var(--ink);font:14px/1.5 system-ui,Segoe UI,Roboto,Arial}
    h1{margin:0 0 8px;font-size:18px}
    .bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px}
    .bar input[type=text], .bar input[type=number]{background:#0f2233;border:1px solid var(--line);color:var(--ink);padding:8px;border-radius:8px}
    .bar label{color:var(--muted);font-size:13px}
    .bar .btn{background:#1d6b57;color:#fff;border:0;padding:8px 12px;border-radius:8px;font-weight:700;cursor:pointer}
    .meta{color:var(--muted);font-size:12px;margin:6px 0 12px}
    pre{background:#0f2233;border:1px solid var(--line);border-radius:10px;padding:12px;white-space:pre-wrap;word-wrap:break-word}
    .line{border-bottom:1px dashed #1b2a3a;padding:6px 4px}
    .ok{background:var(--chip);color:var(--chipText);padding:2px 8px;border-radius:999px;margin-left:8px;font-size:12px}
    a{color:#95cda7;text-decoration:none}
    a:hover{text-decoration:underline}
  </style>
</head>
<body>
  <h1>WhatsApp Log — <code>whatsapp.log</code> <span class="ok"><?= number_format($size) ?> bytes</span></h1>
  <div class="meta">Updated: <?= htmlspecialchars($mtime) ?> • Showing last <?= (int)$lines ?> lines<?= $grep ? " • Filter: /".htmlspecialchars($grep)."/i" : "" ?> • Auto-refresh: <?= $auto ? "ON ({$every}s)" : "OFF" ?></div>

  <form class="bar" method="get">
    <input type="hidden" name="key" value="<?= htmlspecialchars($SECRET) ?>"/>
    <label>Lines
      <input type="number" name="lines" value="<?= (int)$lines ?>" min="1" max="5000" style="width:90px;">
    </label>
    <label>Filter (regex)
      <input type="text" name="grep" value="<?= htmlspecialchars($grep) ?>" placeholder="INCOMING|SEND_TEXT|status">
    </label>
    <label><input type="checkbox" name="auto" value="1" <?= $auto?'checked':''; ?>> Auto refresh</label>
    <label>Every
      <input type="number" name="every" value="<?= (int)$every ?>" min="3" max="120" style="width:80px;"> s
    </label>
    <button class="btn" type="submit">Apply</button>
    <a class="btn" href="?key=<?= urlencode($SECRET) ?>&download=1">Download</a>
    <a class="btn" href="?key=<?= urlencode($SECRET) ?>&lines=300&grep=&auto=1&every=5">Live tail</a>
  </form>

  <pre>
<?php if (empty($filtered)): ?>
<span class="line">No lines match your criteria.</span>
<?php else: foreach ($filtered as $row): ?>
<span class="line"><?= htmlspecialchars($row) ?></span>
<?php endforeach; endif; ?>
  </pre>

  <div class="meta">
    Tip: common filters → <a href="?key=<?= urlencode($SECRET) ?>&grep=INCOMING">INCOMING</a> •
    <a href="?key=<?= urlencode($SECRET) ?>&grep=SEND_TEXT">SEND_TEXT</a> •
    <a href="?key=<?= urlencode($SECRET) ?>&grep=status">status</a>
  </div>
</body>
</html>
