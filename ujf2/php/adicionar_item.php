<?php
require 'config.php'; // Inclua a configuração de conexão com o banco

// Recuperar os dados do POST
$orcamento_id = $_POST['orcamento_id'];
$descricao = $_POST['descricao'];
$valor = $_POST['valor'];
$quantidade = $_POST['quantidade'];
$fornecedor = $_POST['fornecedor'];
$foto = null;

// Calcular o valor total (valor unitário * quantidade)
$total = $valor * $quantidade;

// Verifica se foi enviado um arquivo de foto
if (isset($_FILES['foto']) && $_FILES['foto']['error'] == 0) {
    // Gera o nome do arquivo e move para o diretório desejado
    $foto = basename($_FILES['foto']['name']);
    move_uploaded_file($_FILES['foto']['tmp_name'], '../uploads/' . $foto);
}

// Preparar a query de inserção no banco
$sql = "INSERT INTO itens (orcamento_id, descricao, valor, quantidade, total, fornecedor, foto) VALUES (:orcamento_id, :descricao, :valor, :quantidade, :total, :fornecedor, :foto)";
$stmt = $pdo->prepare($sql);

// Vincular os parâmetros
$stmt->bindParam(':orcamento_id', $orcamento_id);
$stmt->bindParam(':descricao', $descricao);
$stmt->bindParam(':valor', $valor);
$stmt->bindParam(':quantidade', $quantidade);
$stmt->bindParam(':total', $total);
$stmt->bindParam(':fornecedor', $fornecedor);
$stmt->bindParam(':foto', $foto);

// Executar a query e retornar um JSON de sucesso ou erro
if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false]);
}
?>
