<?php
require 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
$descricao = $data['descricao'];
$dataOrcamento = $data['data'];  // Captura a data enviada

// Verifique se a descrição e a data foram recebidas corretamente
if ($descricao && $dataOrcamento) {
    $sql = "INSERT INTO orcamentos (descricao, data) VALUES (:descricao, :data)";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':descricao', $descricao);
    $stmt->bindParam(':data', $dataOrcamento);  // Bind da data

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Orçamento criado com sucesso!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao criar orçamento.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Dados incompletos.']);
}
?>


