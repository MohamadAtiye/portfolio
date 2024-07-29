<?php
try {
    $pdo = new PDO('sqlite:sms.db');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $query = "CREATE TABLE IF NOT EXISTS sms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_user TEXT NOT NULL,
        to_user TEXT NOT NULL,
        content TEXT NOT NULL,
        sendTS TEXT NOT NULL
    )";
    $pdo->exec($query);

    echo "Database and table created successfully.";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}