const DATABASE_URL = "postgresql://neondb_owner:npg_CnyQEf5mPDx6@ep-icy-dew-acdnj5tz-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

// Print no javascript//
console.log("Minha string de conexão é: ", DATABASE_URL);

const host = new URL(DATABASE_URL).host;
const neonHttpEndPoint = `https://${host}/sql`;

// pegar o token no site do neon em DATA API (últimas opções do painel esquerdo)//
const NEON_API_TOKEN = "https://ep-icy-dew-acdnj5tz.apirest.sa-east-1.aws.neon.tech/neondb/rest/v1";
 
// Motor do nosso código que fará as consultas no Neon//
async function executarQueryNeon(querySQL, parametros = []) {
    try {
        const resposta = await fetch(neonHttpEndPoint, {
            method: 'POST',
            headers: {
                'Neon-Connection-String': DATABASE_URL,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: querySQL, //SQL Ex, INSERT INTO.....
                params: parametros // Nome, Email,.....
            })
        });

        if (!resposta.ok) {
            // Resposta do ServIDor Neon
            const errotexto = await resposta.text();
            throw new Error(`Erro HTTP ${resposta.status}: ${errotexto}`);
        }

        const dados = await resposta.json(); // Resposta do Neon com dados
        return dados.rows; // Extraindo linhas dos dados

    } catch (erro) {
        console.error("Falha ao comunicar com o banco de dados: ", erro);
        return null;
    }
}

// C - Create / Criar
export async function insertProduto(nome, preco, categoria) {
    console.log("Cadastrando Produto no banco: ", {nome, preco, categoria});
    // Nossa consulta no banco de dados
    const query = 'INSERT INTO produtos (nome, preco, categoria) VALUES ($1, $2, $3) RETURNING *';
    const params = [nome, preco, categoria];

    // Linhas que o RETURNING irá retornar
    const linhas = await executarQueryNeon(query, params);
    return linhas !== null;
}

// R - Read / Leitura
export async function consultarDiretoComFetch() {
    console.log("Buscando todos os produtos...");

    // Nossa consulta
    const query = 'SELECT * FROM produtos ORDER BY criado_em';

    const linhas = await executarQueryNeon(query);
    return linhas || [];
}

// U - Update / Atualizar
export async function sqlAtualizarProduto(ID, nome, preco, categoria) {
    console.log("Atualizando produto no banco. ID ", ID);
    const query = 'UPDATE produtos SET nome = $1, preco = $2, categoria = $3 WHERE ID = $4 RETURNING *';
    const params = [nome, preco, categoria, ID];

    const linhas = await executarQueryNeon(query, params);
    return linhas !== null;
}

// D - Delete / Deletar
export async function sqldeletarproduto(ID) {
    console.log("Deletando produto do banco. ID ", ID);

    const query = 'DELETE FROM produtos WHERE ID = $1 RETURNING *';

    const params = [ID];

    const linhas = await executarQueryNeon(query, params);

    return linhas !== null;
}