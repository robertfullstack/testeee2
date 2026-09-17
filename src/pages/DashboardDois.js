import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";


function DashboardDois() {

    const [dados, setDados] = useState([]);
    const [loading, setLoading] = useState(false);



    useEffect(() => {

        carregar();

    }, []);



    async function carregar() {

        try {

            setLoading(true);


            const response = await axios.get(
                "http://localhost:3001/dashboard-dois"
            );


            setDados(response.data);


        } catch (error) {

            console.error(error);

            alert("Erro ao carregar dados");

        }
        finally {

            setLoading(false);

        }

    }



    return (

        <div className="dashboard">


            <header className="header">

                <h1>
                    Dashboard Dois
                </h1>

                <p>
                    Hierarquia de Produtos
                </p>

            </header>




            {
                loading ?

                    <div className="loading">
                        Carregando...
                    </div>


                    :


                    <div className="table-box">


                        <h2>
                            Hierarquia Nivel 1
                        </h2>



                        <div className="table-scroll">


                            <table>


                                <thead>

                                    <tr>

                                        <th>
                                            Código
                                        </th>


                                        <th>
                                            Descrição
                                        </th>


                                    </tr>

                                </thead>



                                <tbody>


                                    {
                                        dados.map(item => (


                                            <tr key={item.HierarquiaNivel1}>


                                                <td>
                                                    {item.HierarquiaNivel1}
                                                </td>


                                                <td>
                                                    {item.DescricaoHierarquiaNivel1}
                                                </td>


                                            </tr>


                                        ))
                                    }


                                </tbody>


                            </table>


                        </div>


                    </div>


            }



        </div>

    );


}


export default DashboardDois;