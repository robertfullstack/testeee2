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
    FROM dbo.GoldVendasHierarquiaDiariasMenosTrocas
    ${filtro}
    GROUP BY Filial
),

Anterior AS (
    SELECT
        Filial,
        SUM(ValorTotal) AS VendaAnterior
    FROM dbo.GoldVendasHierarquiaDiariasMenosTrocas
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

app.listen(3001, () => {
    console.log("🚀 API rodando na porta 3001");
});