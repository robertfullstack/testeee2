// import { useEffect, useState } from "react";
// import axios from "axios";

// function App() {
//   const anoAtual = new Date().getFullYear();

//   const [dados, setDados] = useState([]);
//   const [ano, setAno] = useState(anoAtual);
//   const [mes, setMes] = useState("");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     carregar();
//   }, [ano, mes]);

//   async function carregar() {
//     try {
//       setLoading(true);

//       const response = await axios.get(
//         `http://localhost:3001/dashboard?ano=${ano}&mes=${mes}`
//       );

//       setDados(response.data);
//     } catch (error) {
//       console.error(error);
//       alert("Erro ao carregar dashboard");
//     } finally {
//       setLoading(false);
//     }
//   }

//   function moeda(valor) {
//     return Number(valor || 0).toLocaleString("pt-BR", {
//       style: "currency",
//       currency: "BRL"
//     });
//   }

//   return (
//     <div
//       style={{
//         padding: 20,
//         fontFamily: "Arial"
//       }}
//     >
//       <h1>EMPRESA GERAL</h1>

//       {/* FILTROS */}
//       <div
//         style={{
//           display: "flex",
//           gap: 20,
//           marginBottom: 20
//         }}
//       >
//         <div>
//           <label>Ano</label>
//           <br />

//           <select
//             value={ano}
//             onChange={(e) => setAno(e.target.value)}
//           >
//             <option value="2024">2024</option>
//             <option value="2025">2025</option>
//             <option value="2026">2026</option>
//           </select>
//         </div>

//         <div>
//           <label>Mês</label>
//           <br />

//           <select
//             value={mes}
//             onChange={(e) => setMes(e.target.value)}
//           >
//             <option value="">Todos</option>
//             <option value="1">Janeiro</option>
//             <option value="2">Fevereiro</option>
//             <option value="3">Março</option>
//             <option value="4">Abril</option>
//             <option value="5">Maio</option>
//             <option value="6">Junho</option>
//             <option value="7">Julho</option>
//             <option value="8">Agosto</option>
//             <option value="9">Setembro</option>
//             <option value="10">Outubro</option>
//             <option value="11">Novembro</option>
//             <option value="12">Dezembro</option>
//           </select>
//         </div>
//       </div>

//       {loading ? (
//         <h3>Carregando...</h3>
//       ) : (
//         <>
//           <h2>Resumo Geral</h2>

//           <table
//             border="1"
//             cellPadding="8"
//             style={{
//               borderCollapse: "collapse",
//               width: "100%"
//             }}
//           >
//             <thead>
//               <tr>
//                 <th>Filial</th>
//                 <th>Venda Atual</th>
//                 <th>Venda Anterior</th>
//                 <th>Diferença</th>
//                 <th>% Dif.</th>
//                 {/* <th>Quantidade</th> */}
//                 <th>% Participação</th>
//               </tr>
//             </thead>

//             <tbody>
//               {dados.map((item) => (
//                 <tr key={item.Filial}>
//                   <td>{item.Filial}</td>

//                   <td>{moeda(item.VendaAtual)}</td>

//                   <td>{moeda(item.VendaAnterior)}</td>

//                   <td
//                     style={{
//                       color:
//                         Number(item.Diferenca) >= 0
//                           ? "green"
//                           : "red"
//                     }}
//                   >
//                     {moeda(item.Diferenca)}
//                   </td>

//                   <td
//                     style={{
//                       color:
//                         Number(item.PercentualDiferenca) >= 0
//                           ? "green"
//                           : "red"
//                     }}
//                   >
//                     {Number(
//                       item.PercentualDiferenca || 0
//                     ).toFixed(2)}
//                     %
//                   </td>

//                   {/* <td>
//                     {Number(
//                       item.QuantidadeVendida || 0
//                     ).toLocaleString("pt-BR")}
//                   </td> */}

//                   <td>
//                     {Number(
//                       item.PercentualParticipacao || 0
//                     ).toFixed(2)}
//                     %
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           <h2 style={{ marginTop: 30 }}>
//             TOP 10 FILIAIS
//           </h2>

//           <table
//             border="1"
//             cellPadding="8"
//             style={{
//               borderCollapse: "collapse",
//               width: "700px"
//             }}
//           >
//             <thead>
//               <tr>
//                 <th>Filial</th>
//                 <th>Venda Atual</th>
//                 <th>% Participação</th>
//               </tr>
//             </thead>

//             <tbody>
//               {dados.slice(0, 10).map((item) => (
//                 <tr key={`top-${item.Filial}`}>
//                   <td>{item.Filial}</td>

//                   <td>{moeda(item.VendaAtual)}</td>

//                   <td>
//                     {Number(
//                       item.PercentualParticipacao || 0
//                     ).toFixed(2)}
//                     %
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </>
//       )}
//     </div>
//   );
// }

// export default App;





























// -----------------------------------------------------------------------------------------------------------------------------------------
import { useEffect, useState } from "react";
import CountUp from "react-countup";
import axios from "axios";

function App() {
  const anoAtual = new Date().getFullYear();

  const [dados, setDados] = useState([]);
  const [ano, setAno] = useState(anoAtual);
  const [mes, setMes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregar();
  }, [ano, mes]);

  async function carregar() {
    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:3001/dashboard?ano=${ano}&mes=${mes}`
      );

      setDados(response.data);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar dashboard");
    } finally {
      setLoading(false);
    }
  }

  function moeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  const vendaTotal = dados.reduce(
    (acc, item) => acc + Number(item.VendaAtual || 0),
    0
  );

  const vendaAnteriorTotal = dados.reduce(
    (acc, item) => acc + Number(item.VendaAnterior || 0),
    0
  );

  const crescimento =
    vendaAnteriorTotal > 0
      ? ((vendaTotal - vendaAnteriorTotal) / vendaAnteriorTotal) * 100
      : 0;

  const maiorVenda = Math.max(
    ...dados.map((d) => Number(d.VendaAtual || 0)),
    0
  );

  const isMobile = window.innerWidth < 768;

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f4f6f9",
      padding: isMobile ? "15px" : "30px",
      fontFamily: "Segoe UI, sans-serif",
    },

    header: {
      marginBottom: "20px",
    },

    title: {
      margin: 0,
      color: "#111827",
      fontSize: isMobile ? "22px" : "32px",
      fontWeight: "700",
    },

    subtitle: {
      marginTop: "6px",
      color: "#6b7280",
      fontSize: isMobile ? "13px" : "16px",
    },

    filtros: {
      background: "#fff",
      padding: "15px",
      borderRadius: "16px",
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: "15px",
      marginBottom: "20px",
      boxShadow: "0 3px 15px rgba(0,0,0,0.08)",
    },

    select: {
      padding: "10px",
      borderRadius: "10px",
      border: "1px solid #d1d5db",
      width: isMobile ? "100%" : "180px",
      marginTop: "5px",
    },

    cards: {
      display: "grid",
      gridTemplateColumns: isMobile
        ? "1fr"
        : "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "15px",
      marginBottom: "20px",
    },

    card: {
      background: "#fff",
      padding: isMobile ? "15px" : "25px",
      borderRadius: "16px",
      boxShadow: "0 3px 15px rgba(0,0,0,0.08)",
    },

    cardTitle: {
      color: "#6b7280",
      fontSize: "13px",
      marginBottom: "8px",
    },

    cardValue: {
      fontSize: isMobile ? "20px" : "28px",
      fontWeight: "700",
      color: "#111827",
    },

    tableCard: {
      background: "#fff",
      borderRadius: "16px",
      padding: "15px",
      marginBottom: "20px",
      boxShadow: "0 3px 15px rgba(0,0,0,0.08)",
      overflowX: "auto",
    },

    sectionTitle: {
      marginBottom: "15px",
      color: "#111827",
      fontSize: isMobile ? "16px" : "20px",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: isMobile ? "600px" : "100%",
    },

    th: {
      background: "#111827",
      color: "#fff",
      padding: "10px",
      textAlign: "left",
      fontSize: "13px",
      whiteSpace: "nowrap",
    },

    td: {
      padding: "10px",
      borderBottom: "1px solid #e5e7eb",
      fontSize: "13px",
      whiteSpace: "nowrap",
    },

    positive: {
      color: "#10b981",
      fontWeight: "700",
    },

    negative: {
      color: "#ef4444",
      fontWeight: "700",
    },
    loading: {
      height: "60vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "#6b7280",
      fontSize: "14px",
    },

    spinner: {
      width: "50px",
      height: "50px",
      border: "5px solid #e5e7eb",
      borderTop: "5px solid #111827",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      marginBottom: "10px",
    },
  };
  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Dashboard Comercial</h1>

        <p style={styles.subtitle}>
          Visão consolidada de vendas das filiais
        </p>
      </div>

      <div style={styles.filtros}>
        <div>
          <label>
            <strong>Ano</strong>
          </label>

          <br />

          <select
            style={styles.select}
            value={ano}
            onChange={(e) => setAno(e.target.value)}
          >
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>

        <div>
          <label>
            <strong>Mês</strong>
          </label>

          <br />

          <select
            style={styles.select}
            value={mes}
            onChange={(e) => setMes(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="1">Janeiro</option>
            <option value="2">Fevereiro</option>
            <option value="3">Março</option>
            <option value="4">Abril</option>
            <option value="5">Maio</option>
            <option value="6">Junho</option>
            <option value="7">Julho</option>
            <option value="8">Agosto</option>
            <option value="9">Setembro</option>
            <option value="10">Outubro</option>
            <option value="11">Novembro</option>
            <option value="12">Dezembro</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Carregando dashboard...</p>
        </div>) : (
        <>
          <div style={styles.cards}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Venda Total</div>

              <div style={styles.cardValue}>
                <CountUp
                  end={vendaTotal}
                  duration={0.3}
                  separator="."
                  decimals={2}
                  decimal=","
                  prefix="R$ "
                />
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>Filiais</div>
              <div style={styles.cardValue}>
                <CountUp end={dados.length} duration={0.3} />
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>Maior Venda</div>

              {/* <div style={styles.cardValue}>
                {moeda(maiorVenda)}

              </div> */}
              <div style={styles.cardValue}>
                <CountUp
                  end={maiorVenda}
                  duration={0.3}
                  separator="."
                  decimals={2}
                  decimal=","
                  prefix="R$ "
                />
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>Crescimento</div>

              <div
                style={{
                  ...styles.cardValue,
                  color:
                    crescimento >= 0
                      ? "#10b981"
                      : "#ef4444",
                }}
              >
                {crescimento.toFixed(2)}%
              </div>
            </div>
          </div>

          <div style={styles.tableCard}>
            <h2 style={styles.sectionTitle}>
              Resumo Geral
            </h2>

            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Filial</th>
                  <th style={styles.th}>Venda Atual</th>
                  <th style={styles.th}>Venda Anterior</th>
                  <th style={styles.th}>Diferença</th>
                  <th style={styles.th}>% Dif.</th>
                  <th style={styles.th}>% Participação</th>
                </tr>
              </thead>

              <tbody>
                {dados.map((item) => (
                  <tr key={item.Filial}>
                    <td style={styles.td}>{item.Filial}</td>

                    <td style={styles.td}>
                      {moeda(item.VendaAtual)}
                    </td>

                    <td style={styles.td}>
                      {moeda(item.VendaAnterior)}
                    </td>

                    <td
                      style={{
                        ...styles.td,
                        ...(Number(item.Diferenca) >= 0
                          ? styles.positive
                          : styles.negative),
                      }}
                    >
                      {moeda(item.Diferenca)}
                    </td>

                    <td
                      style={{
                        ...styles.td,
                        ...(Number(
                          item.PercentualDiferenca
                        ) >= 0
                          ? styles.positive
                          : styles.negative),
                      }}
                    >
                      {Number(
                        item.PercentualDiferenca || 0
                      ).toFixed(2)}
                      %
                    </td>

                    <td style={styles.td}>
                      {Number(
                        item.PercentualParticipacao || 0
                      ).toFixed(2)}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={styles.tableCard}>
            <h2 style={styles.sectionTitle}>
              TOP 10 FILIAIS
            </h2>

            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Filial</th>
                  <th style={styles.th}>Venda Atual</th>
                  <th style={styles.th}>% Participação</th>
                </tr>
              </thead>

              <tbody>
                {dados
                  .sort(
                    (a, b) =>
                      Number(b.VendaAtual) -
                      Number(a.VendaAtual)
                  )
                  .slice(0, 10)
                  .map((item) => (
                    <tr key={item.Filial}>
                      <td style={styles.td}>
                        {item.Filial}
                      </td>

                      <td style={styles.td}>
                        {moeda(item.VendaAtual)}
                      </td>

                      <td style={styles.td}>
                        {Number(
                          item.PercentualParticipacao || 0
                        ).toFixed(2)}
                        %
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default App;