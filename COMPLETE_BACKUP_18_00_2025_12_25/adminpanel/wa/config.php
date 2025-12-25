<?php
/* =================== 365NEO — WhatsApp Bot Config =================== */
/* Fill these from your WhatsApp Manager & Server env */
define('WA_TOKEN',            'EAAVy3gIhzOgBPurMFkT0pIqoxbtjQhYhfbFy1Iapd7ZAn1hrOQag32ZCnIJ1C5yxg2Ya6pAEJNssxCrucRgyZAKNDXsbOo4Khdm0XoZBl1sksp27RvU5pQRrtBRvA3PjdZCJ9FZCBugQ6Ta6YEoIZC7dyRl6ykGEVlfMTafsNUAp4PW3jftuVulCECCRITXSJZBVko0r1lDONVJK'); // <-- regenerate & set as env var
define('WA_PHONE_NUMBER_ID',  '2108063213282772'); // your Phone Number ID
define('WA_VERIFY_TOKEN',     '365neo-secret-verify'); // use same in WhatsApp "Verify token"

define('WA_GRAPH_BASE',       'https://graph.facebook.com/v22.0/');
define('WA_TIMEOUT',          12);
define('WA_LOG_FILE',         __DIR__ . '/whatsapp.log'); // make writable or set to null

/* =================== MySQL =================== */
define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_USER', getenv('DB_USER') ?: 'u799530173_Neo_whatsapp');
define('DB_PASS', getenv('DB_PASS') ?: 'Neo_whatsapp@123');
define('DB_NAME', getenv('DB_NAME') ?: 'u799530173_Neo_whatsapp');

/* Open DB connection */
function db() {
  static $mysqli = null;
  if ($mysqli === null) {
    $mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($mysqli->connect_errno) {
      error_log("DB connect error: " . $mysqli->connect_error);
      http_response_code(500);
      exit('DB error');
    }
    $mysqli->set_charset('utf8mb4');
  }
  return $mysqli;
}
