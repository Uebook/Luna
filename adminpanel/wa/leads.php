<?php
require __DIR__ . '/config.php';
$mysqli = db();
$res = $mysqli->query("SELECT id, wa_id, name, service, city, budget, timeline, step, created_at FROM leads ORDER BY id DESC");
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>365Neo — WhatsApp Leads</title>
  <style>
    body{font-family:system-ui,Segoe UI,Roboto,Arial;background:#f6f7f9;margin:0;padding:24px}
    h1{margin:0 0 16px}
    table{width:100%;border-collapse:collapse;background:#fff}
    th,td{padding:10px;border-bottom:1px solid #e5e7eb;font-size:14px;text-align:left}
    th{background:#e9f6ef}
    .chip{padding:2px 8px;border-radius:999px;background:#e5f5ee;font-weight:600}
  </style>
</head>
<body>
  <h1>365Neo — WhatsApp Leads</h1>
  <table>
    <thead>
      <tr>
        <th>#</th><th>WA ID</th><th>Name</th><th>Service</th><th>City</th><th>Budget</th><th>Timeline</th><th>Status</th><th>Created</th>
      </tr>
    </thead>
    <tbody>
      <?php while($row = $res->fetch_assoc()): ?>
        <tr>
          <td><?= htmlspecialchars($row['id']) ?></td>
          <td><?= htmlspecialchars($row['wa_id']) ?></td>
          <td><?= htmlspecialchars($row['name']) ?></td>
          <td><?= htmlspecialchars($row['service']) ?></td>
          <td><?= htmlspecialchars($row['city']) ?></td>
          <td><?= htmlspecialchars($row['budget']) ?></td>
          <td><?= htmlspecialchars($row['timeline']) ?></td>
          <td><span class="chip"><?= ((int)$row['step']>=5?'completed':'in-progress') ?></span></td>
          <td><?= htmlspecialchars($row['created_at']) ?></td>
        </tr>
      <?php endwhile; ?>
    </tbody>
  </table>
</body>
</html>
