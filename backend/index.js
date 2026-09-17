const express = require("express");
const cors = require("cors");
const sql = require("mssql/msnodesqlv8");

const app = express();

app.use(cors());
app.use(express.json());

// CONFIG SQL SERVER
const config = {
    connectionString:
        "Driver={ODBC Driver 17 for SQL Server};Server=vanquish;Database=dbdatalake;Trusted_Connection=Yes;",
    requestTimeout: 300000
};

app.get("/", (req, res) => {
    res.json({ status: "ok", message: "API funcionando" });

    // I will put here and after remove

});
app.get("/transferencias-com-produtos", async (req, res) => {

    let poolVanquish;
    let poolLandrover;

    try {

        // ==========================================
        // VANQUISH
        // ==========================================

        const configVanquish = {
            connectionString:
                "Driver={ODBC Driver 17 for SQL Server};Server=vanquish;Database=dbdatalake;Trusted_Connection=Yes;",
            requestTimeout: 300000
        };


        // ==========================================
        // LANDROVER
        // ==========================================

        const configLandrover = {
            connectionString:
                "Driver={ODBC Driver 17 for SQL Server};Server=LANDROVER;Database=COLETOR_SAP;Trusted_Connection=Yes;",
            requestTimeout: 300000
        };


        // ==========================================
        // CONECTAR
        // ==========================================

        console.log("Conectando VANQUISH...");

        poolVanquish =
            await new sql.ConnectionPool(
                configVanquish
            ).connect();

        console.log("VANQUISH conectado");


        console.log("Conectando LANDROVER...");

        poolLandrover =
            await new sql.ConnectionPool(
                configLandrover
            ).connect();

        console.log("LANDROVER conectado");


        // ==========================================
        // BUSCAR TRANSFERÊNCIAS
        // ==========================================

        const transferenciasResult =
            await poolLandrover
                .request()
                .query(`
                    SELECT TOP 100

                        CODIGO,
                        AUTORIZACAO,

                        COD_FILIAL_ORIGEM,
                        FILIAL_ORIGEM,

                        COD_FILIAL_DESTINO,
                        FILIAL_DESTINO,

                        PRODUTO,
                        QUANTIDADE,

                        STATUS,

                        DATA_TRANSFERENCIA,
                        DATA_ENVIO_LINX,

                        TIPO,
                        TIPO_TRANSFERENCIA,

                        VOLUME,
                        TTIMESTAMP,

                        USUALT,
                        TIPO_CANCELAMENTO

                    FROM dbo.PDA_TB_TRANSFERENCIA_REQUISICAO
                `);


        const transferencias =
            transferenciasResult.recordset;


        console.log(
            "Transferências encontradas:",
            transferencias.length
        );


        // ==========================================
        // BUSCAR SILVER MATERIAL
        // ==========================================

        const silverResult =
            await poolVanquish
                .request()
                .query(`
                    SELECT

                        ID,
                        TipoMaterial,
                        Codigo,
                        Cor,
                        Descricao,
                        GrupoMercadorias,
                        HierarquiaNivel6,
                        Marca,
                        Tamanho,
                        UpdateDate,
                        Nivel1,
                        Nivel2,
                        Nivel3,
                        Nivel4

                    FROM dbo.SilverMaterial
                `);


        const silver =
            silverResult.recordset;


        console.log(
            "Produtos SilverMaterial:",
            silver.length
        );


        // ==========================================
        // CRIAR MAPA
        // ==========================================

        const mapaProdutos = new Map();


        for (const produto of silver) {

            const codigo =
                String(
                    produto.Codigo
                ).trim();


            mapaProdutos.set(
                codigo,
                produto
            );

        }


        // ==========================================
        // RELACIONAMENTO
        //
        // SilverMaterial.Codigo
        //
        // =
        //
        // PDA_TB_TRANSFERENCIA_REQUISICAO.PRODUTO
        // ==========================================

        const resultado =
            transferencias.map(
                transferencia => {

                    const codigo =
                        String(
                            transferencia.PRODUTO
                        ).trim();


                    const produto =
                        mapaProdutos.get(
                            codigo
                        );


                    return {

                        // ==================================
                        // TRANSFERÊNCIA
                        // ==================================

                        codigoTransferencia:
                            transferencia.CODIGO,

                        autorizacao:
                            transferencia.AUTORIZACAO,


                        codigoFilialOrigem:
                            transferencia.COD_FILIAL_ORIGEM,

                        filialOrigem:
                            transferencia.FILIAL_ORIGEM,


                        codigoFilialDestino:
                            transferencia.COD_FILIAL_DESTINO,

                        filialDestino:
                            transferencia.FILIAL_DESTINO,


                        produto:
                            transferencia.PRODUTO,

                        quantidade:
                            transferencia.QUANTIDADE,


                        status:
                            transferencia.STATUS,


                        dataTransferencia:
                            transferencia.DATA_TRANSFERENCIA,

                        dataEnvioLinx:
                            transferencia.DATA_ENVIO_LINX,


                        tipo:
                            transferencia.TIPO,

                        tipoTransferencia:
                            transferencia.TIPO_TRANSFERENCIA,


                        volume:
                            transferencia.VOLUME,

                        timestamp:
                            transferencia.TTIMESTAMP,


                        usualt:
                            transferencia.USUALT,

                        tipoCancelamento:
                            transferencia.TIPO_CANCELAMENTO,


                        // ==================================
                        // SILVER MATERIAL
                        // ==================================

                        silverID:
                            produto
                                ? produto.ID
                                : null,

                        tipoMaterial:
                            produto
                                ? produto.TipoMaterial
                                : null,

                        codigoSilver:
                            produto
                                ? produto.Codigo
                                : null,

                        cor:
                            produto
                                ? produto.Cor
                                : null,

                        descricao:
                            produto
                                ? produto.Descricao
                                : null,

                        grupoMercadorias:
                            produto
                                ? produto.GrupoMercadorias
                                : null,

                        hierarquiaNivel6:
                            produto
                                ? produto.HierarquiaNivel6
                                : null,

                        marca:
                            produto
                                ? produto.Marca
                                : null,

                        tamanho:
                            produto
                                ? produto.Tamanho
                                : null,

                        updateDate:
                            produto
                                ? produto.UpdateDate
                                : null,

                        nivel1:
                            produto
                                ? produto.Nivel1
                                : null,

                        nivel2:
                            produto
                                ? produto.Nivel2
                                : null,

                        nivel3:
                            produto
                                ? produto.Nivel3
                                : null,

                        nivel4:
                            produto
                                ? produto.Nivel4
                                : null

                    };

                }
            );


        // ==========================================
        // RETORNO
        // ==========================================

        res.json(resultado);


    } catch (err) {

        console.error(
            "ERRO:",
            err
        );


        res.status(500).json({
            erro: err.message
        });


    } finally {

        // ==========================================
        // FECHAR CONEXÕES
        // ==========================================

        if (poolVanquish) {

            try {
                await poolVanquish.close();
            } catch { }

        }


        if (poolLandrover) {

            try {
                await poolLandrover.close();
            } catch { }

        }

    }

});

app.get("/quantidade-por-status-2", async (req, res) => {

    let pool;

    try {

        const configLandrover = {
            connectionString:
                "Driver={ODBC Driver 17 for SQL Server};Server=LANDROVER;Database=COLETOR_SAP;Trusted_Connection=Yes;",
            requestTimeout: 300000
        };

        pool = await new sql.ConnectionPool(
            configLandrover
        ).connect();

        // ==========================================
        // DESCOBRIR ONDE O NODE ESTÁ CONECTADO
        // ==========================================

        const conexao = await pool.request().query(`
            SELECT
                @@SERVERNAME AS servidor,
                DB_NAME() AS banco
        `);

        console.log("=================================");
        console.log("CONEXÃO USADA PELO NODE:");
        console.table(conexao.recordset);
        console.log("=================================");


        // ==========================================
        // CONSULTA
        // ==========================================

        const result = await pool.request().query(`
            SELECT
                STATUS,
                COUNT(*) AS totalLinhas,
                COALESCE(SUM(QUANTIDADE), 0) AS quantidadeTotal
            FROM dbo.PDA_TB_TRANSFERENCIA_REQUISICAO
            GROUP BY STATUS
            ORDER BY STATUS
        `);


        console.log("RESULTADO:");
        console.table(result.recordset);


        res.json(result.recordset);


    } catch (err) {

        console.error("ERRO:", err);

        res.status(500).json({
            erro: err.message
        });

    } finally {

        if (pool) {

            try {
                await pool.close();
            } catch { }

        }

    }

});





























// -------------------  NOW YEAH -------------------
app.get("/status-2-por-categoria", async (req, res) => {

    let poolLandrover;
    let poolVanquish;

    try {

        // ==========================================
        // CONFIG LANDROVER
        // ==========================================

        const configLandrover = {
            connectionString:
                "Driver={ODBC Driver 17 for SQL Server};Server=LANDROVER;Database=COLETOR_SAP;Trusted_Connection=Yes;",
            requestTimeout: 300000
        };


        // ==========================================
        // CONFIG VANQUISH
        // ==========================================

        const configVanquish = {
            connectionString:
                "Driver={ODBC Driver 17 for SQL Server};Server=vanquish;Database=dbdatalake;Trusted_Connection=Yes;",
            requestTimeout: 300000
        };


        // ==========================================
        // CONECTAR LANDROVER
        // ==========================================

        console.log("Conectando LANDROVER...");

        poolLandrover =
            await new sql.ConnectionPool(
                configLandrover
            ).connect();

        console.log("LANDROVER conectado");


        // ==========================================
        // CONECTAR VANQUISH
        // ==========================================

        console.log("Conectando VANQUISH...");

        poolVanquish =
            await new sql.ConnectionPool(
                configVanquish
            ).connect();

        console.log("VANQUISH conectado");


        // ==========================================
        // 1. PEGAR SOMENTE STATUS 2
        // ==========================================

        const transferenciasResult =
            await poolLandrover
                .request()
                .query(`
                    SELECT
                        PRODUTO,
                        QUANTIDADE
                    FROM dbo.PDA_TB_TRANSFERENCIA_REQUISICAO
                    WHERE STATUS = 2
                `);


        const transferencias =
            transferenciasResult.recordset;


        console.log(
            "Transferências STATUS 2:",
            transferencias.length
        );


        // ==========================================
        // 2. PEGAR PRODUTOS DO SILVER MATERIAL
        // ==========================================

        const silverResult =
            await poolVanquish
                .request()
                .query(`
                    SELECT
                        Codigo,
                        Nivel1
                    FROM dbo.SilverMaterial
                    WHERE Nivel1 IN (101, 102, 103)
                `);


        const silver =
            silverResult.recordset;


        console.log(
            "Produtos encontrados no SilverMaterial:",
            silver.length
        );


        // ==========================================
        // 3. CRIAR MAPA
        //
        // Exemplo:
        //
        // Silver:
        // 000000000582016002
        //
        // Transferência:
        // 582016002
        //
        // Os dois serão convertidos para:
        // 582016002
        // ==========================================

        const mapaProdutos = new Map();


        for (const produto of silver) {

            const codigo =
                String(
                    produto.Codigo
                ).trim();


            // Remove zeros à esquerda
            const codigoNormalizado =
                codigo.replace(/^0+/, "");


            mapaProdutos.set(
                codigoNormalizado,
                String(
                    produto.Nivel1
                ).trim()
            );

        }


        // ==========================================
        // 4. CATEGORIAS
        // ==========================================

        const categorias = {

            "101": {
                categoria: "CONFECÇÃO",
                nivel1: "101",
                totalLinhas: 0,
                quantidadeTotal: 0
            },

            "102": {
                categoria: "CALÇADO",
                nivel1: "102",
                totalLinhas: 0,
                quantidadeTotal: 0
            },

            "103": {
                categoria: "ACESSÓRIOS",
                nivel1: "103",
                totalLinhas: 0,
                quantidadeTotal: 0
            }

        };


        // ==========================================
        // 5. RELACIONAR
        // ==========================================

        let encontrados = 0;
        let naoEncontrados = 0;


        for (const transferencia of transferencias) {

            const produto =
                String(
                    transferencia.PRODUTO
                ).trim();


            // Normaliza o PRODUTO da transferência
            const codigoNormalizado =
                produto.replace(/^0+/, "");


            const nivel1 =
                mapaProdutos.get(
                    codigoNormalizado
                );


            // Não encontrou no SilverMaterial
            if (!nivel1) {

                naoEncontrados++;

                continue;

            }


            // Não é 101, 102 ou 103
            if (!categorias[nivel1]) {

                continue;

            }


            encontrados++;


            // ======================================
            // SOMAR LINHA
            // ======================================

            categorias[nivel1].totalLinhas++;


            // ======================================
            // SOMAR QUANTIDADE
            // ======================================

            categorias[nivel1].quantidadeTotal +=
                Number(
                    transferencia.QUANTIDADE
                ) || 0;

        }


        // ==========================================
        // 6. RESULTADO
        // ==========================================

        const resultado =
            Object.values(categorias);


        // ==========================================
        // 7. TOTAL
        // ==========================================

        const total = {

            categoria: "TOTAL",

            nivel1: null,

            totalLinhas:
                resultado.reduce(
                    (total, item) =>
                        total + item.totalLinhas,
                    0
                ),

            quantidadeTotal:
                resultado.reduce(
                    (total, item) =>
                        total + item.quantidadeTotal,
                    0
                )

        };


        console.log(
            "Produtos encontrados:",
            encontrados
        );

        console.log(
            "Produtos não encontrados:",
            naoEncontrados
        );


        // ==========================================
        // 8. RETORNO
        // ==========================================

        res.json([
            ...resultado,
            total
        ]);


    } catch (err) {

        console.error(
            "ERRO:",
            err
        );


        res.status(500).json({
            erro: err.message
        });


    } finally {


        if (poolLandrover) {

            try {
                await poolLandrover.close();
            } catch { }

        }


        if (poolVanquish) {

            try {
                await poolVanquish.close();
            } catch { }

        }

    }

});
// -------------------  NOW YEAH -------------------

app.get("/status-2-por-categoria-more-info", async (req, res) => {

    let poolLandrover;
    let poolVanquish;

    try {

        // ==========================================
        // CONFIG LANDROVER
        // ==========================================

        const configLandrover = {
            connectionString:
                "Driver={ODBC Driver 17 for SQL Server};Server=LANDROVER;Database=COLETOR_SAP;Trusted_Connection=Yes;",
            requestTimeout: 300000
        };


        // ==========================================
        // CONFIG VANQUISH
        // ==========================================

        const configVanquish = {
            connectionString:
                "Driver={ODBC Driver 17 for SQL Server};Server=vanquish;Database=dbdatalake;Trusted_Connection=Yes;",
            requestTimeout: 300000
        };


        // ==========================================
        // CONECTAR LANDROVER
        // ==========================================

        console.log("Conectando LANDROVER...");

        poolLandrover =
            await new sql.ConnectionPool(
                configLandrover
            ).connect();

        console.log("LANDROVER conectado");


        // ==========================================
        // CONECTAR VANQUISH
        // ==========================================

        console.log("Conectando VANQUISH...");

        poolVanquish =
            await new sql.ConnectionPool(
                configVanquish
            ).connect();

        console.log("VANQUISH conectado");


        // ==========================================
        // 1. STATUS 2
        // ==========================================

        console.log("Buscando STATUS 2...");

        const transferenciasResult =
            await poolLandrover
                .request()
                .query(`
                    SELECT
                        CODIGO,
                        AUTORIZACAO,

                        COD_FILIAL_ORIGEM,
                        FILIAL_ORIGEM,

                        COD_FILIAL_DESTINO,
                        FILIAL_DESTINO,

                        PRODUTO,
                        QUANTIDADE,

                        STATUS,

                        DATA_TRANSFERENCIA,
                        DATA_ENVIO_LINX,

                        TIPO,
                        TIPO_TRANSFERENCIA,

                        VOLUME,
                        TTIMESTAMP,

                        USUALT,
                        TIPO_CANCELAMENTO

                    FROM dbo.PDA_TB_TRANSFERENCIA_REQUISICAO

                    WHERE STATUS = 2
                `);


        const transferencias =
            transferenciasResult.recordset;


        console.log(
            "STATUS 2 encontrados:",
            transferencias.length
        );


        // ==========================================
        // 2. SILVER MATERIAL
        // ==========================================

        console.log(
            "Buscando produtos no SilverMaterial..."
        );

        const silverResult =
            await poolVanquish
                .request()
                .query(`
                    SELECT
                        ID,
                        TipoMaterial,
                        Codigo,
                        Cor,
                        Descricao,
                        GrupoMercadorias,
                        HierarquiaNivel6,
                        Marca,
                        Tamanho,
                        UpdateDate,
                        Nivel1,
                        Nivel2,
                        Nivel3,
                        Nivel4

                    FROM dbo.SilverMaterial
                `);


        const silver =
            silverResult.recordset;


        console.log(
            "SilverMaterial encontrados:",
            silver.length
        );


        // ==========================================
        // 3. MAPA DOS PRODUTOS
        // ==========================================

        const mapaProdutos = new Map();


        for (const produto of silver) {

            const codigo =
                String(
                    produto.Codigo
                ).trim();


            // Remove zeros à esquerda
            const codigoNormalizado =
                codigo.replace(/^0+/, "");


            mapaProdutos.set(
                codigoNormalizado,
                produto
            );

        }


        // ==========================================
        // 4. RELACIONAR TRANSFERÊNCIA + PRODUTO
        // ==========================================

        let encontrados = 0;
        let naoEncontrados = 0;


        const resultado =
            transferencias.map(
                transferencia => {

                    const codigoProduto =
                        String(
                            transferencia.PRODUTO
                        ).trim();


                    const codigoNormalizado =
                        codigoProduto.replace(
                            /^0+/,
                            ""
                        );


                    const produto =
                        mapaProdutos.get(
                            codigoNormalizado
                        );


                    if (produto) {
                        encontrados++;
                    } else {
                        naoEncontrados++;
                    }


                    // ==================================
                    // CATEGORIA
                    // ==================================

                    let categoria = null;


                    if (
                        produto &&
                        String(produto.Nivel1).trim() === "101"
                    ) {

                        categoria = "CONFECÇÃO";

                    } else if (
                        produto &&
                        String(produto.Nivel1).trim() === "102"
                    ) {

                        categoria = "CALÇADO";

                    } else if (
                        produto &&
                        String(produto.Nivel1).trim() === "103"
                    ) {

                        categoria = "ACESSÓRIOS";

                    }


                    // ==================================
                    // RETORNO
                    // ==================================

                    return {

                        // ==================================
                        // CATEGORIA
                        // ==================================

                        categoria: categoria,

                        nivel1:
                            produto
                                ? produto.Nivel1
                                : null,

                        nivel2:
                            produto
                                ? produto.Nivel2
                                : null,

                        nivel3:
                            produto
                                ? produto.Nivel3
                                : null,

                        nivel4:
                            produto
                                ? produto.Nivel4
                                : null,


                        // ==================================
                        // TRANSFERÊNCIA
                        // ==================================

                        codigoTransferencia:
                            transferencia.CODIGO,

                        autorizacao:
                            transferencia.AUTORIZACAO,


                        codigoFilialOrigem:
                            transferencia.COD_FILIAL_ORIGEM,

                        filialOrigem:
                            transferencia.FILIAL_ORIGEM,


                        codigoFilialDestino:
                            transferencia.COD_FILIAL_DESTINO,

                        filialDestino:
                            transferencia.FILIAL_DESTINO,


                        produto:
                            transferencia.PRODUTO,

                        quantidade:
                            transferencia.QUANTIDADE,


                        status:
                            transferencia.STATUS,


                        dataTransferencia:
                            transferencia.DATA_TRANSFERENCIA,

                        dataEnvioLinx:
                            transferencia.DATA_ENVIO_LINX,


                        tipo:
                            transferencia.TIPO,

                        tipoTransferencia:
                            transferencia.TIPO_TRANSFERENCIA,


                        volume:
                            transferencia.VOLUME,

                        timestamp:
                            transferencia.TTIMESTAMP,


                        usualt:
                            transferencia.USUALT,

                        tipoCancelamento:
                            transferencia.TIPO_CANCELAMENTO,


                        // ==================================
                        // SILVER MATERIAL
                        // ==================================

                        silverID:
                            produto
                                ? produto.ID
                                : null,

                        tipoMaterial:
                            produto
                                ? produto.TipoMaterial
                                : null,

                        codigoSilver:
                            produto
                                ? produto.Codigo
                                : null,

                        cor:
                            produto
                                ? produto.Cor
                                : null,

                        descricao:
                            produto
                                ? produto.Descricao
                                : null,

                        grupoMercadorias:
                            produto
                                ? produto.GrupoMercadorias
                                : null,

                        hierarquiaNivel6:
                            produto
                                ? produto.HierarquiaNivel6
                                : null,

                        marca:
                            produto
                                ? produto.Marca
                                : null,

                        tamanho:
                            produto
                                ? produto.Tamanho
                                : null,

                        updateDate:
                            produto
                                ? produto.UpdateDate
                                : null

                    };

                }
            );


        // ==========================================
        // LOGS
        // ==========================================

        console.log(
            "Produtos relacionados:",
            encontrados
        );

        console.log(
            "Produtos não encontrados:",
            naoEncontrados
        );


        // ==========================================
        // RETORNO
        // ==========================================

        res.json({

            status: 2,

            totalLinhas: transferencias.length,

            encontradosSilverMaterial:
                encontrados,

            naoEncontradosSilverMaterial:
                naoEncontrados,

            dados: resultado

        });


    } catch (err) {

        console.error(
            "ERRO:",
            err
        );


        res.status(500).json({
            erro: err.message
        });


    } finally {


        if (poolLandrover) {

            try {
                await poolLandrover.close();
            } catch { }

        }


        if (poolVanquish) {

            try {
                await poolVanquish.close();
            } catch { }

        }

    }

});








app.get("/dashboard-gatos", async (req, res) => {

    let poolVanquish;
    let poolLandrover;

    try {

        // ==========================================
        // CONFIG VANQUISH
        // ==========================================

        const configVanquish = {
            connectionString:
                "Driver={ODBC Driver 17 for SQL Server};Server=vanquish;Database=dbdatalake;Trusted_Connection=Yes;",
            requestTimeout: 300000
        };


        // ==========================================
        // CONFIG LANDROVER
        // ==========================================

        const configLandrover = {
            connectionString:
                "Driver={ODBC Driver 17 for SQL Server};Server=LANDROVER;Database=COLETOR_SAP;Trusted_Connection=Yes;",
            requestTimeout: 300000
        };


        // ==========================================
        // CONECTAR LANDROVER
        // ==========================================

        console.log("Conectando LANDROVER...");

        poolLandrover =
            await new sql.ConnectionPool(
                configLandrover
            ).connect();

        console.log("LANDROVER conectado");


        // ==========================================
        // 1. PEGAR TRANSFERÊNCIAS
        //
        // STATUS = 7
        //
        // AGRUPADO POR PRODUTO
        // ==========================================

        console.log(
            "Buscando transferências STATUS 7..."
        );

        const transferenciasResult =
            await poolLandrover
                .request()
                .query(`
                    SELECT
                        PRODUTO,
                        SUM(QUANTIDADE) AS QUANTIDADE,
                        COUNT(*) AS TOTAL_LINHAS
                    FROM dbo.PDA_TB_TRANSFERENCIA_REQUISICAO
                    WHERE STATUS = 7
                    GROUP BY PRODUTO
                `);


        const transferencias =
            transferenciasResult.recordset;


        console.log(
            "Produtos agrupados:",
            transferencias.length
        );


        // ==========================================
        // 2. CONECTAR VANQUISH
        // ==========================================

        console.log("Conectando VANQUISH...");

        poolVanquish =
            await new sql.ConnectionPool(
                configVanquish
            ).connect();

        console.log("VANQUISH conectado");


        // ==========================================
        // 3. BUSCAR SILVER MATERIAL
        //
        // SOMENTE NIVEL1 101, 102 E 103
        //
        // NÃO PRECISAMOS DE TODOS OS CAMPOS
        // ==========================================

        console.log(
            "Buscando SilverMaterial..."
        );

        const silverResult =
            await poolVanquish
                .request()
                .query(`
                    SELECT
                        Codigo,
                        Nivel1
                    FROM dbo.SilverMaterial
                    WHERE Nivel1 IN (101, 102, 103)
                `);


        const silver =
            silverResult.recordset;


        console.log(
            "SilverMaterial encontrados:",
            silver.length
        );


        // ==========================================
        // 4. CRIAR MAPA
        //
        // IMPORTANTE:
        //
        // LANDROVER:
        // 505242014
        //
        // VANQUISH:
        // 000000000505242014
        //
        // COMPARAÇÃO:
        // ÚLTIMOS 9 DÍGITOS
        // ==========================================

        const mapaProdutos =
            new Map();


        for (const produto of silver) {

            const codigo =
                String(
                    produto.Codigo
                ).trim();


            const codigoUltimos9 =
                codigo.slice(-9);


            mapaProdutos.set(
                codigoUltimos9,
                String(
                    produto.Nivel1
                ).trim()
            );

        }


        console.log(
            "Mapa de produtos criado:",
            mapaProdutos.size
        );


        // ==========================================
        // 5. CATEGORIAS
        // ==========================================

        const categorias = {

            "101": {
                categoria: "CONFECÇÃO",
                nivel1: "101",
                qtdGatos: 0,
                qtdDanificados: 0,
                linhas: 0
            },

            "102": {
                categoria: "CALÇADO",
                nivel1: "102",
                qtdGatos: 0,
                qtdDanificados: 0,
                linhas: 0
            },

            "103": {
                categoria: "ACESSÓRIOS",
                nivel1: "103",
                qtdGatos: 0,
                qtdDanificados: 0,
                linhas: 0
            }

        };


        // ==========================================
        // 6. RELACIONAR PRODUTO
        //
        // LANDROVER.PRODUTO
        //
        // COM
        //
        // RIGHT(VANQUISH.Codigo, 9)
        // ==========================================

        let encontrados = 0;
        let naoEncontrados = 0;


        for (const transferencia of transferencias) {

            const codigo =
                String(
                    transferencia.PRODUTO
                ).trim();


            const nivel1 =
                mapaProdutos.get(
                    codigo
                );


            // Produto não encontrado
            if (!nivel1) {

                naoEncontrados++;

                continue;

            }


            // Categoria não existe
            if (!categorias[nivel1]) {

                continue;

            }


            encontrados++;


            // ======================================
            // SOMA QUANTIDADE
            // ======================================

            categorias[nivel1].qtdGatos +=
                Number(
                    transferencia.QUANTIDADE
                ) || 0;


            // ======================================
            // SOMA QUANTIDADE DE LINHAS
            // ======================================

            categorias[nivel1].linhas +=
                Number(
                    transferencia.TOTAL_LINHAS
                ) || 0;

        }


        console.log(
            "Produtos encontrados:",
            encontrados
        );

        console.log(
            "Produtos não encontrados:",
            naoEncontrados
        );


        // ==========================================
        // 7. RESULTADO
        // ==========================================

        const resultado =
            Object.values(categorias);


        // ==========================================
        // 8. TOTAL
        // ==========================================

        const total = {

            categoria: "Total",

            nivel1: null,

            qtdGatos:
                resultado.reduce(
                    (total, item) =>
                        total + item.qtdGatos,
                    0
                ),

            qtdDanificados: 0,

            linhas:
                resultado.reduce(
                    (total, item) =>
                        total + item.linhas,
                    0
                )

        };


        // ==========================================
        // 9. RETORNO
        // ==========================================

        res.json([
            ...resultado,
            total
        ]);


    } catch (err) {

        console.error(
            "ERRO:",
            err
        );


        res.status(500).json({
            erro: err.message
        });


    } finally {

        // ==========================================
        // FECHAR VANQUISH
        // ==========================================

        if (poolVanquish) {

            try {
                await poolVanquish.close();
            } catch { }

        }


        // ==========================================
        // FECHAR LANDROVER
        // ==========================================

        if (poolLandrover) {

            try {
                await poolLandrover.close();
            } catch { }

        }

    }

});





app.get("/estrutura-transferencias", async (req, res) => {
    try {

        const configColetor = {
            connectionString:
                "Driver={ODBC Driver 17 for SQL Server};Server=LANDROVER;Database=COLETOR_SAP;Trusted_Connection=Yes;",
            requestTimeout: 300000
        };

        const pool = await new sql.ConnectionPool(configColetor).connect();

        const result = await pool.request().query(`
            SELECT
                TABLE_NAME,
                COLUMN_NAME,
                DATA_TYPE,
                CHARACTER_MAXIMUM_LENGTH
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME IN (
                'PDA_TB_TRANSFERENCIA_REQUISICAO',
                'PDA_TB_TIPO_TRANSFERENCIA',
                'PDA_TB_STATUS_TRANSFERENCIA'
            )
            ORDER BY TABLE_NAME, ORDINAL_POSITION
        `);

        await pool.close();

        res.json(result.recordset);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            erro: err.message
        });

    }
});
app.get("/transferencias", async (req, res) => {
    try {

        const configColetor = {
            connectionString:
                "Driver={ODBC Driver 17 for SQL Server};Server=LANDROVER;Database=COLETOR_SAP;Trusted_Connection=Yes;",
            requestTimeout: 300000
        };

        const pool = await new sql.ConnectionPool(configColetor).connect();

        const result = await pool.request().query(`
            SELECT TOP 100 *
            FROM dbo.PDA_TB_TRANSFERENCIA_REQUISICAO
        `);

        await pool.close();

        res.json(result.recordset);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            erro: err.message
        });

    }
});

app.get("/dashboard", async (req, res) => {
    try {

        const ano = req.query.ano;
        const mes = req.query.mes;

        await sql.connect(config);

        let where = [];

        if (ano) {
            where.push(`YEAR(DataCupom) = ${parseInt(ano)}`);
        }

        if (mes) {
            where.push(`MONTH(DataCupom) = ${parseInt(mes)}`);
        }

        const filtro =
            where.length > 0
                ? `WHERE ${where.join(" AND ")}`
                : "";

        const result = await sql.query(`
WITH Atual AS (
    SELECT
        Filial,
        SUM(ValorTotal) AS VendaAtual,
        SUM(Quantidade) AS QuantidadeVendida
    FROM dbo.GoldVendasHierarquiaDiariasMenosTrocasEstoque
    ${filtro}
    GROUP BY Filial
),

Anterior AS (
    SELECT
        Filial,
        SUM(ValorTotal) AS VendaAnterior
    FROM dbo.GoldVendasHierarquiaDiariasMenosTrocasEstoque
    WHERE YEAR(DataCupom) = ${parseInt(ano) - 1}
    ${mes
                ? `AND MONTH(DataCupom) = ${parseInt(mes)}`
                : ""
            }
    GROUP BY Filial
)

SELECT
    A.Filial,
    A.VendaAtual,
    A.QuantidadeVendida,

    ISNULL(B.VendaAnterior,0) AS VendaAnterior,

    A.VendaAtual - ISNULL(B.VendaAnterior,0)
        AS Diferenca,

    ROUND(
        (
            (A.VendaAtual - ISNULL(B.VendaAnterior,0))
            * 100.0
        )
        /
        NULLIF(B.VendaAnterior,0),
        2
    ) AS PercentualDiferenca,

    ROUND(
        (A.VendaAtual * 100.0)
        /
        SUM(A.VendaAtual) OVER(),
        2
    ) AS PercentualParticipacao

FROM Atual A
LEFT JOIN Anterior B
    ON A.Filial = B.Filial

ORDER BY A.VendaAtual DESC
`);

        res.json(result.recordset);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            erro: err.message
        });
    }
});

app.get("/teste", async (req, res) => {
    try {
        await sql.connect(config);

        const result = await sql.query(`
            SELECT TOP 10 *
            FROM dbo.GoldVendasHierarquiaDiariasMenosTrocas
        `);

        res.json(result.recordset);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/dashboard-dois", async (req, res) => {
    try {

        const ano = req.query.ano;
        const mes = req.query.mes;

        await sql.connect(config);


        const result = await sql.query(`

WITH Atual AS (

    SELECT
        Filial,
        SUM(ValorTotal) AS VendaAtual,
        SUM(Quantidade) AS QuantidadeVendida

    FROM dbo.GoldVendasHierarquiaDiariasMenosTrocasEstoque

    WHERE HierarquiaNivel1 = 101

    ${ano ? `AND YEAR(DataCupom) = ${parseInt(ano)}` : ""}

    ${mes ? `AND MONTH(DataCupom) = ${parseInt(mes)}` : ""}

    GROUP BY Filial

),


Anterior AS (

    SELECT
        Filial,
        SUM(ValorTotal) AS VendaAnterior

    FROM dbo.GoldVendasHierarquiaDiariasMenosTrocasEstoque

    WHERE HierarquiaNivel1 = 101

    ${ano ? `AND YEAR(DataCupom) = ${parseInt(ano) - 1}` : ""}

    ${mes ? `AND MONTH(DataCupom) = ${parseInt(mes)}` : ""}

    GROUP BY Filial

)


SELECT

    A.Filial,

    A.VendaAtual,

    A.QuantidadeVendida,

    ISNULL(B.VendaAnterior,0) AS VendaAnterior,


    A.VendaAtual - ISNULL(B.VendaAnterior,0)
        AS Diferenca,


    ROUND(
        (
            (A.VendaAtual - ISNULL(B.VendaAnterior,0))
            * 100.0
        )
        /
        NULLIF(B.VendaAnterior,0),
        2
    ) AS PercentualDiferenca,


    ROUND(
        (A.VendaAtual * 100.0)
        /
        SUM(A.VendaAtual) OVER(),
        2
    ) AS PercentualParticipacao


FROM Atual A

LEFT JOIN Anterior B
ON A.Filial = B.Filial


ORDER BY A.VendaAtual DESC


        `);


        res.json(result.recordset);


    } catch (err) {

        console.error(err);

        res.status(500).json({
            erro: err.message
        });

    }

});

app.get("/count", async (req, res) => {
    try {
        await sql.connect(config);

        const result = await sql.query(`
            SELECT COUNT(*) AS Total
            FROM dbo.GoldVendasHierarquiaDiariasMenosTrocas
        `);

        res.json(result.recordset);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});




















































































































































































































































































































app.get("/quantidade-status-1", async (req, res) => {

    let pool;

    try {

        const configLandrover = {
            connectionString:
                "Driver={ODBC Driver 17 for SQL Server};Server=LANDROVER;Database=COLETOR_SAP;Trusted_Connection=Yes;",
            requestTimeout: 300000
        };

        console.log("Conectando LANDROVER...");

        pool = await new sql.ConnectionPool(
            configLandrover
        ).connect();

        console.log("LANDROVER conectado");


        // ==========================================
        // SOMA STATUS 1
        // ==========================================

        const result = await pool.request().query(`
            SELECT
                COUNT(*) AS totalLinhas,
                COALESCE(SUM(QUANTIDADE), 0) AS quantidadeTotal
            FROM dbo.PDA_TB_TRANSFERENCIA_REQUISICAO
            WHERE STATUS = 1
        `);


        const dados = result.recordset[0];


        const totalLinhas =
            Number(dados.totalLinhas) || 0;

        const quantidadeTotal =
            Number(dados.quantidadeTotal) || 0;


        console.log(
            "Linhas STATUS 1:",
            totalLinhas
        );

        console.log(
            "Quantidade total STATUS 1:",
            quantidadeTotal
        );


        res.json({

            status: 1,

            totalLinhas:
                totalLinhas,

            quantidadeTotal:
                quantidadeTotal

        });


    } catch (err) {

        console.error("ERRO:", err);

        res.status(500).json({
            erro: err.message
        });

    } finally {

        if (pool) {

            try {
                await pool.close();
            } catch { }

        }

    }

});




app.get("/quantidade-por-status", async (req, res) => {

    let pool;

    try {

        const configLandrover = {
            connectionString:
                "Driver={ODBC Driver 17 for SQL Server};Server=LANDROVER;Database=COLETOR_SAP;Trusted_Connection=Yes;",
            requestTimeout: 300000
        };

        pool = await new sql.ConnectionPool(
            configLandrover
        ).connect();

        const result = await pool.request().query(`
            SELECT
                STATUS,
                COUNT(*) AS totalLinhas,
                COALESCE(SUM(QUANTIDADE), 0) AS quantidadeTotal
            FROM dbo.PDA_TB_TRANSFERENCIA_REQUISICAO
            GROUP BY STATUS
            ORDER BY STATUS
        `);

        res.json(result.recordset);

    } catch (err) {

        console.error("ERRO:", err);

        res.status(500).json({
            erro: err.message
        });

    } finally {

        if (pool) {
            try {
                await pool.close();
            } catch { }
        }

    }

});



































app.listen(5000, () => {
    console.log("API rodando na porta 3001");
});