document.addEventListener('DOMContentLoaded', () => {
    const descricaoOrcamentoInput = document.getElementById('descricao-orcamento');
    const criarOrcamentoBtn = document.getElementById('criar-orcamento');
    const descricaoItemInput = document.getElementById('descricao-item');
    const valorItemInput = document.getElementById('valor-item');
    const fornecedorItemInput = document.getElementById('fornecedor-item');
    const quantidadeItemInput = document.getElementById('quantidade-item'); // Novo campo de quantidade
    const fotoItemInput = document.getElementById('foto-item');
    const adicionarItemBtn = document.getElementById('adicionar-item');
    const listaOrcamentos = document.getElementById('lista-orcamentos');
    const listaItens = document.getElementById('lista-itens');
    const totalItensSpan = document.getElementById('total-itens');
    const nomeOrcamentoSpan = document.getElementById('nome-orcamento');
    const excluirOrcamentoBtn = document.getElementById('excluir-orcamento');
    const gerarBackupBtn = document.getElementById('gerar-backup');
    const restaurarBackupInput = document.getElementById('restaurar-backup');
    const restaurarBackupBtn = document.getElementById('restaurar-backup-btn');
    let orcamentoAtual = null;

    // Função para criar um novo orçamento
    criarOrcamentoBtn.addEventListener('click', () => {
        const descricaoOrcamento = descricaoOrcamentoInput.value.trim();
        const dataOrcamento = document.getElementById('data').value; // Pega a data

        if (descricaoOrcamento && dataOrcamento) {
            fetch('php/criar_orcamento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    descricao: descricaoOrcamento,
                    data: dataOrcamento  // Envia também a data
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        descricaoOrcamentoInput.value = ''; // Limpar campo após criar
                        document.getElementById('data').value = ''; // Limpar campo de data
                        carregarOrcamentos(); // Atualizar lista de orçamentos
                    } else {
                        alert('Erro ao criar orçamento.');
                    }
                });
        } else {
            alert('Por favor, insira a descrição e a data do orçamento.');
        }
    });


    // Função para carregar os orçamentos armazenados
    function carregarOrcamentos() {
        fetch('php/carregar_orcamentos.php')
            .then(response => response.json())
            .then(data => {
                listaOrcamentos.innerHTML = '';
                data.forEach(orcamento => {
                    const li = document.createElement('li');

                    // Adicionar descrição e data ao item de lista
                    const dataFormatada = new Date(orcamento.data).toLocaleDateString('pt-BR'); // Formatar a data
                    li.textContent = `${orcamento.descricao} - ${dataFormatada}`;

                    const btnCarregar = document.createElement('button');
                    btnCarregar.textContent = 'Carregar';
                    btnCarregar.addEventListener('click', () => carregarOrcamento(orcamento.id));
                    li.appendChild(btnCarregar);
                    listaOrcamentos.appendChild(li);
                });
            });
    }


    // Função para carregar um orçamento específico
    function carregarOrcamento(id) {
        fetch(`php/carregar_orcamento.php?id=${id}`)
            .then(response => response.json())
            .then(data => {
                orcamentoAtual = data;
                nomeOrcamentoSpan.textContent = orcamentoAtual.descricao;
                nomeOrcamentoSpan.style.color = '#007bff'; // Destaque para o orçamento carregado
                atualizarListaItens();
                verificarExclusaoOrcamento();  // Verifica se o orçamento pode ser excluído
            });
    }

    // Função para adicionar um item ao orçamento
    adicionarItemBtn.addEventListener('click', () => {
        if (!orcamentoAtual) {
            alert('Por favor, carregue um orçamento primeiro.');
            return;
        }

        const descricaoItem = descricaoItemInput.value.trim();
        const valorItem = parseFloat(valorItemInput.value);
        const quantidadeItem = parseInt(quantidadeItemInput.value); // Captura a quantidade do item
        const fornecedorItem = fornecedorItemInput.value.trim();
        const fotoItem = fotoItemInput.files[0];

        if (descricaoItem && !isNaN(valorItem) && valorItem > 0 && !isNaN(quantidadeItem) && quantidadeItem > 0) {
            const formData = new FormData();
            formData.append('orcamento_id', orcamentoAtual.id);
            formData.append('descricao', descricaoItem);
            formData.append('valor', valorItem);
            formData.append('quantidade', quantidadeItem); // Envia a quantidade
            formData.append('fornecedor', fornecedorItem);
            if (fotoItem) {
                formData.append('foto', fotoItem);
            }

            fetch('php/adicionar_item.php', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        descricaoItemInput.value = '';
                        valorItemInput.value = '';
                        quantidadeItemInput.value = ''; // Limpar campo de quantidade
                        fornecedorItemInput.value = '';
                        fotoItemInput.value = '';
                        atualizarListaItens(); // Atualizar a lista de itens
                    } else {
                        alert('Erro ao adicionar item.');
                    }
                });
        } else {
            alert('Por favor, preencha todos os campos corretamente.');
        }
    });

    // Função para atualizar a lista de itens do orçamento
    function atualizarListaItens() {
        if (!orcamentoAtual) return;

        fetch(`php/carregar_orcamento.php?id=${orcamentoAtual.id}`)
            .then(response => response.json())
            .then(data => {
                listaItens.innerHTML = '';
                let total = 0;
                data.itens.forEach(item => {
                    const li = document.createElement('li');
                    const totalItem = item.valor * item.quantidade; // Calcula o total do item com base na quantidade
                    li.innerHTML = `${item.descricao}  (Fornecedor: ${item.fornecedor}) R$ ${item.valor} - ${item.quantidade} unidades  - R$ ${totalItem.toFixed(2)}`;
                    if (item.foto) {
                        const img = document.createElement('img');
                        img.src = `uploads/${item.foto}`;
                        li.appendChild(img);
                    }
                    const btnExcluir = document.createElement('button');
                    btnExcluir.textContent = 'Excluir';
                    btnExcluir.addEventListener('click', () => excluirItem(item.id));
                    li.appendChild(btnExcluir);
                    listaItens.appendChild(li);
                    total += totalItem;
                });
                totalItensSpan.textContent = total.toFixed(2);
            });
    }


    // Função para excluir um item do orçamento
    function excluirItem(itemId) {
        fetch('php/excluir_item.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: itemId })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    atualizarListaItens(); // Atualizar a lista de itens
                } else {
                    alert('Erro ao excluir item.');
                }
            });
    }

    // Função para verificar se o orçamento pode ser excluído
    function verificarExclusaoOrcamento() {
        if (orcamentoAtual.itens.length === 0) {
            excluirOrcamentoBtn.style.display = 'block';
            excluirOrcamentoBtn.onclick = () => excluirOrcamento();
        } else {
            excluirOrcamentoBtn.style.display = 'none';
        }
    }

    // Função para excluir o orçamento
    function excluirOrcamento() {
        if (orcamentoAtual && orcamentoAtual.itens.length === 0) {
            fetch('php/excluir_orcamento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: orcamentoAtual.id })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        carregarOrcamentos(); // Atualiza a lista de orçamentos
                        nomeOrcamentoSpan.textContent = 'Nenhum';
                        listaItens.innerHTML = '';
                        totalItensSpan.textContent = '0.00';
                        alert('Orçamento excluído com sucesso!');
                    } else {
                        alert('Erro ao excluir orçamento.');
                    }
                });
        }
    }

    // Função para gerar o backup em arquivo JSON com imagens
    gerarBackupBtn.addEventListener('click', () => {
        fetch('php/gerar_backup.php')
            .then(response => response.json())
            .then(data => {
                const jsonBackup = JSON.stringify(data, null, 2);
                const blob = new Blob([jsonBackup], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'backup_orcamentos.json';
                a.click();
                URL.revokeObjectURL(url);
            });
    });

    // Função para restaurar o backup de arquivo JSON com imagens
    restaurarBackupBtn.addEventListener('click', () => {
        const file = restaurarBackupInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const dados = JSON.parse(e.target.result);
                fetch('php/restaurar_backup.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dados)
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            carregarOrcamentos(); // Atualiza a lista após restaurar
                            alert('Backup restaurado com sucesso!');
                        } else {
                            alert('Erro ao restaurar backup.');
                        }
                    });
            };
            reader.readAsText(file);
        }
    });

    // Carregar orçamentos ao iniciar a página
    carregarOrcamentos();
});
