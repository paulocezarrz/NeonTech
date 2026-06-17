// Importando as funções do script_db.js
import {
    consultarDiretoComFetch,
    insertProduto,
    sqlAtualizarProduto,
    sqldeletarproduto
} from './script_db.js';

// Elementos principias do HTML
const formProdutos = document.getElementById('form-produto');
const tabelaProdutos = document.getElementById('tabela-corpo');
const btnCancelar = document.getElementById('btn-cancelar');
const formTitulo = document.getElementById('form-titulo');
const btnSalvarText = document.getElementById('btn-salvar-text');

//===============================
// Funções visuais, auxiliares
//===============================

function limparFormulario() {
    formProdutos.reset();
    document.getElementById('produto-id').value = '';

    formTitulo.textContent = "Salvar produto"; // Resetar título
    btnSalvarText.textContent = "Salvar produto"; // Resetar btn Salvar 
    btnCancelar.classList.add('hidden'); // Resetar Visibilidade do btn Cancelar
}

function mostrarToast(mensagem, tipo = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');

    const cores = { success: 'bg-green-600', error: 'bg-rose-600', info: 'bg-blue-600' };
    const icones = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' }

    toast.className = `toast-enter ${cores[tipo]} toast-message`;
    toast.innerHTML = `
    <i class="fas ${icones[tipo]} text-lg"></i>
    <span>${mensagem}</span>`
        ;

    container.appendChild(toast);

    //fazer toast sumir depois de 3 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Ler dado sdo Banco de Dados Neon

async function criartabelaProdutos() {
    const dados = await consultarDiretoComFetch();

    tabelaProdutos.innerHTML = '';

    if (!dados || dados.length === 0) {
        tabelaProdutos.innerHTML = `
        <tr>
        <td colspan="4" class="empty-state">Nenhum produto encontrado.</td>
        </tr>`;
        return;
    }

    dados.forEach(produto => {
        const linha = document.createElement('tr');

        linha.innerHTML = `
        <td class="cell-id">#${produto.id}</td>
        <td>
        <p class="cell-name">${produto.nome}</p>
        <p class="cell-preco">${produto.categoria}</p>
        </td>
        <td>
        <span class="badge badge-active">
            ${new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(produto.preco)}
        </span>
        </td>
        <td>
        <div class="action-container">
        <button onclick="prepararEdicao(${produto.id}, '${produto.nome}', '${produto.preco}', '${produto.categoria}')" class="btn-action btn-edit" title="Editar">
        <i class="fas fa-pen"></i>
        </button>
        <button onclick=deletarproduto(${produto.id}) class="btn-action btn-delete" title="Excluir">
        <i class="fas fa-trash"></i>
        </button>
        </div>
        </td>
        `;
        tabelaProdutos.appendChild(linha);
    });
}
window.criartabelaProdutos = criartabelaProdutos;

// Criar e atualizar

window.prepararEdicao = function (id, nome, preco, categoria) {
    document.getElementById('produto-id').value = id;
    document.getElementById('produto-nome').value = nome;
    document.getElementById('preco').value = preco;
    document.getElementById('produto-categoria').value = categoria

    formTitulo.textContent = "Editar Produto";
    btnSalvarText.textContent = "Atualizar Produto";
    btnCancelar.classList.remove('hidden');
}

async function lidarComEnvioFormulario(event) {
    event.preventDefault();
    const id = document.getElementById('produto-id').value;
    const nome = document.getElementById('produto-nome').value;
    const preco = document.getElementById('preco').value;
    const categoria = document.getElementById('produto-categoria').value;

    let sucesso = false;

    if (id) {
        console.log("Atualizando produto: ", (id, nome, preco, categoria));
        sucesso = await sqlAtualizarProduto(id, nome, preco, categoria);
        if (sucesso) {
            mostrarToast("produto atualizado com sucesso", "success")
        }

    } else {
        console.log("Criando um novo produto: ", { nome, preco, categoria });
        sucesso = await insertProduto(nome, preco, categoria);
        if (sucesso) {
            mostrarToast("produto cadastrado com sucesso", "success")
        }
    }

    if (!sucesso) {
        mostrarToast("Ocorreu um erro na operação.", "error");
        return;
    }
    
    limparFormulario();
    criartabelaProdutos();
}

window.deletarproduto = async function (id) {
    if (confirm("Tem certeza que deseja exibir esse produto?")) {
        const sucesso = await sqldeletarproduto(id);

        if (sucesso) {
            mostrarToast("Produto excluido com sucesso", "success");
            criartabelaProdutos();
        }
        else {
            mostrarToast("Erro ao excluir produto", "error")
        }
    }
}

formProdutos.addEventListener('submit', lidarComEnvioFormulario);

btnCancelar.addEventListener('click', limparFormulario);

criartabelaProdutos();



