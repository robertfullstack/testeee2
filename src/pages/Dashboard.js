import { useEffect, useState } from "react";
import CountUp from "react-countup";
import axios from "axios";
import "./Dashboard.css";


function Dashboard() {
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
    return Number(valor || 0).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL"
      }
    );
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
      ?
      ((vendaTotal - vendaAnteriorTotal) / vendaAnteriorTotal) * 100
      :
      0;
  const maiorVenda = Math.max(
    ...dados.map(d => Number(d.VendaAtual || 0)),
    0
  );

  return (
    <div className="dashboard">
      <header className="header">
        <h1>
          Dashboard Comercial
        </h1>
        <p>
          Visão consolidada de vendas das filiais
        </p>
      </header>

      <div className="filtros">
        <div>
          <label>Ano          </label>

          <select
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
            Mês
          </label>


          <select
            value={mes}
            onChange={(e) => setMes(e.target.value)}
          >


            <option value="">
              Todos
            </option>

            <option value="1">
              Janeiro
            </option>

            <option value="2">
              Fevereiro
            </option>

            <option value="3">
              Março
            </option>

            <option value="4">
              Abril
            </option>

            <option value="5">
              Maio
            </option>

            <option value="6">
              Junho
            </option>

            <option value="7">
              Julho
            </option>

            <option value="8">
              Agosto
            </option>

            <option value="9">
              Setembro
            </option>

            <option value="10">
              Outubro
            </option>

            <option value="11">
              Novembro
            </option>

            <option value="12">
              Dezembro
            </option>


          </select>


        </div>


      </div>






      {
        loading ?

          <div className="loading">
            Carregando dashboard...
          </div>

          :

          <>


            <div className="cards">


              <div>
                <span>
                  Venda Total
                </span>

                <strong>

                  <CountUp
                    end={vendaTotal}
                    duration={0.5}
                    prefix="R$ "
                    separator="."
                    decimal=","
                    decimals={2}
                  />

                </strong>

              </div>




              <div>

                <span>
                  Filiais
                </span>

                <strong>

                  <CountUp
                    end={dados.length}
                    duration={0.5}
                  />

                </strong>

              </div>





              <div>

                <span>
                  Maior Venda
                </span>


                <strong>

                  <CountUp
                    end={maiorVenda}
                    duration={0.5}
                    prefix="R$ "
                    separator="."
                    decimal=","
                    decimals={2}
                  />

                </strong>


              </div>





              <div>

                <span>
                  Crescimento
                </span>


                <strong>

                  {crescimento.toFixed(2)}%

                </strong>


              </div>



            </div>







            <div className="table-box">


              <h2>
                Resumo Geral
              </h2>


              <div className="table-scroll">


                <table style={{ width: "100%" }}>

                  <thead>

                    <tr>

                      <th>
                        Filial
                      </th>

                      <th>
                        Venda Atual
                      </th>

                      <th>
                        Diferença
                      </th>

                      <th>
                        % Dif.
                      </th>


                    </tr>

                  </thead>



                  <tbody>


                    {
                      dados.map(item => {


                        const positivo =
                          Number(item.Diferenca) >= 0;



                        return (

                          <tr key={item.Filial}>


                            <td>
                              {item.Filial}
                            </td>



                            <td>
                              {moeda(item.VendaAtual)}
                            </td>



                            <td className={
                              positivo ? "positivo" : "negativo"
                            }>


                              <div>
                                {moeda(item.Diferenca)}
                              </div>


                              <small style={{ textAlign: 'center' }}>
                                {Number(item.PercentualDiferenca || 0).toFixed(2)}%
                              </small>


                            </td>



                            <td>

                              {
                                Number(
                                  item.PercentualParticipacao || 0
                                ).toFixed(2)
                              }

                              %

                            </td>



                          </tr>

                        )


                      })

                    }



                  </tbody>


                </table>


              </div>


            </div>









            <div className="table-box">


              <h2>
                TOP 10 FILIAIS
              </h2>



              <div className="table-scroll">


                <table style={{ width: "100%" }}>

                  <thead>

                    <tr>

                      <th>
                        Filial
                      </th>

                      <th>
                        Venda Atual
                      </th>

                      <th>
                        Participação
                      </th>


                    </tr>

                  </thead>


                  <tbody>


                    {
                      dados
                        .sort(
                          (a, b) =>
                            Number(b.VendaAtual) - Number(a.VendaAtual)
                        )
                        .slice(0, 10)
                        .map(item => (


                          <tr key={item.Filial}>


                            <td>
                              {item.Filial}
                            </td>


                            <td>
                              {moeda(item.VendaAtual)}
                            </td>


                            <td>
                              {
                                Number(
                                  item.PercentualParticipacao || 0
                                ).toFixed(2)
                              }
                              %

                            </td>


                          </tr>


                        ))


                    }


                  </tbody>


                </table>



              </div>



            </div>






          </>

      }



    </div>


  )

}


export default Dashboard;