
const CHAVE_CARRINHO = "feels_carrinho";

const produtos = {
    lavanda: { nome: "Vela de Lavanda", preco: 39.90 },
    baunilha: { nome: "Vela de Baunilha", preco: 42.90 },
    canela: { nome: "Vela de Canela", preco: 39.90 },
    "capim-limao": { nome: "Vela de Capim-Limão", preco: 44.90 },
    algodao: { nome: "Vela de Algodão", preco: 39.90 },
    floral: { nome: "Vela Floral", preco: 45.90 }
};

// Substitua pelo número que receberá os pedidos
const numeroVendedor = "5511999999999";

function obterCarrinho() {
    try {
        const salvo = JSON.parse(localStorage.getItem(CHAVE_CARRINHO));
        if (!salvo || typeof salvo !== "object" || Array.isArray(salvo)) {
            return {};
        }

        const carrinho = {};
        for (const id of Object.keys(produtos)) {
            const quantidade = salvo[id];
            if (Number.isSafeInteger(quantidade) && quantidade > 0) {
                carrinho[id] = quantidade;
            }
        }
        return carrinho;
    } catch {
        return {};
    }
}

function salvarCarrinho(carrinho) {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
    atualizarContador();
    mostrarCarrinho();
}

function adicionarCarrinho(id) {
    if (!produtos[id]) return;

    const carrinho = obterCarrinho();
    carrinho[id] = (carrinho[id] || 0) + 1;
    salvarCarrinho(carrinho);

mostrarNotificacao(produtos[id].nome + " adicionada ao carrinho!");
}

function alterarQuantidade(id, diferenca) {
    if (!produtos[id]) return;

    const carrinho = obterCarrinho();
    carrinho[id] = Math.max(0, (carrinho[id] || 0) + diferenca);

    if (carrinho[id] === 0) {
        delete carrinho[id];
    }

    salvarCarrinho(carrinho);
}

function removerProduto(id) {
    const carrinho = obterCarrinho();
    delete carrinho[id];
    salvarCarrinho(carrinho);
}

function atualizarContador() {
    const contador = document.getElementById("contador-carrinho");
    if (!contador) return;

    const quantidade = Object.values(obterCarrinho())
        .reduce((soma, valor) => soma + valor, 0);

    contador.textContent = quantidade;
}

function formatarPreco(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function mostrarCarrinho() {
    const lista = document.getElementById("lista-carrinho");
    const totalElemento = document.getElementById("total-carrinho");

    if (!lista || !totalElemento) return;

    const carrinho = obterCarrinho();
    lista.innerHTML = "";
    let total = 0;

    for (const [id, quantidade] of Object.entries(carrinho)) {
        const produto = produtos[id];
        const subtotal = produto.preco * quantidade;
        total += subtotal;

        const item = document.createElement("div");
        item.className = "item-carrinho";

        const detalhes = document.createElement("div");
        const nome = document.createElement("h3");
        nome.textContent = produto.nome;
        const preco = document.createElement("p");
        preco.textContent = formatarPreco(subtotal);
        detalhes.append(nome, preco);

        const controles = document.createElement("div");
        controles.className = "controles-carrinho";

        const menos = document.createElement("button");
        menos.textContent = "−";
        menos.setAttribute("aria-label", "Diminuir " + produto.nome);
        menos.addEventListener("click", () => alterarQuantidade(id, -1));

        const numero = document.createElement("span");
        numero.textContent = quantidade;

        const mais = document.createElement("button");
        mais.textContent = "+";
        mais.setAttribute("aria-label", "Aumentar " + produto.nome);
        mais.addEventListener("click", () => alterarQuantidade(id, 1));

        const remover = document.createElement("button");
        remover.textContent = "Remover";
        remover.addEventListener("click", () => removerProduto(id));

        controles.append(menos, numero, mais, remover);
        item.append(detalhes, controles);
        lista.appendChild(item);
    }

    if (Object.keys(carrinho).length === 0) {
        lista.textContent = "Seu carrinho está vazio.";
    }

    totalElemento.textContent = formatarPreco(total);

    const finalizar = document.getElementById("finalizar-pedido");
    if (finalizar) finalizar.disabled = total === 0;
}

function finalizarPedido() {
    const carrinho = obterCarrinho();

    if (Object.keys(carrinho).length === 0) {
        alert("Seu carrinho está vazio.");
        return;
    }

    if (numeroVendedor === "5511999999999") {
        alert("Configure o número do vendedor no arquivo js/carrinho.js.");
        return;
    }

    let mensagem = "Olá! Gostaria de fazer um pedido na Feels:\n\n";
    let total = 0;

    for (const [id, quantidade] of Object.entries(carrinho)) {
        const produto = produtos[id];
        const subtotal = produto.preco * quantidade;
        total += subtotal;

        mensagem += `${quantidade}x ${produto.nome} - ${formatarPreco(subtotal)}\n`;
    }

    mensagem += `\nTotal dos produtos: ${formatarPreco(total)}`;
    mensagem += "\n\nGostaria de confirmar a disponibilidade e combinar a entrega.";

    const link = "https://wa.me/" + numeroVendedor +
        "?text=" + encodeURIComponent(mensagem);

    window.open(link, "_blank", "noopener,noreferrer");
}

document.addEventListener("DOMContentLoaded", () => {
    atualizarContador();
    mostrarCarrinho();

    document.querySelectorAll("[data-produto]").forEach(botao => {
        botao.addEventListener("click", () => {
            adicionarCarrinho(botao.dataset.produto);
        });
    });

    const finalizar = document.getElementById("finalizar-pedido");
    if (finalizar) {
        finalizar.addEventListener("click", finalizarPedido);
    }
});


let temporizadorNotificacao;

function mostrarNotificacao(mensagem) {
    let aviso = document.getElementById("notificacao-feels");

    if (!aviso) {
        aviso = document.createElement("div");
        aviso.id = "notificacao-feels";
        document.body.appendChild(aviso);
    }

    aviso.textContent = "✓ " + mensagem;

    aviso.style.cssText = `
        position: fixed;
        bottom: 25px;
        right: 25px;
        background: white;
        color: #3b5b45;
        padding: 15px 20px;
        border-left: 5px solid #25d366;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 99999;
        max-width: calc(100vw - 50px);
        opacity: 1;
        transition: opacity 0.3s;
        font-size: 15px;
    `;

    clearTimeout(temporizadorNotificacao);

    temporizadorNotificacao = setTimeout(() => {
        aviso.style.opacity = "0";
    }, 3000);
}
