# Histórias de Usuário

Critérios de aceite resumidos. Os identificadores de casos de uso (UC) referem-se ao [diagrama de casos de uso](diagramas/casos-de-uso.png).

## Visitante
| ID | História | Critérios de aceite | UC |
|---|---|---|---|
| HU01 | Como **visitante**, quero me cadastrar (como cliente ou agente) para poder utilizar o sistema. | O sistema só é usado após cadastro prévio; CPF/CNPJ válidos e únicos; e-mail único; cliente informa de 1 a 3 rendimentos (entidade empregadora e valor). | UC01 |
| HU02 | Como **usuário cadastrado**, quero entrar com e-mail e senha para acessar as funcionalidades do meu perfil. | Credenciais inválidas exibem erro; páginas internas redirecionam ao login quando não há sessão. | UC02 |

## Cliente
| ID | História | Critérios de aceite | UC |
|---|---|---|---|
| HU03 | Como **cliente**, quero consultar, alterar e excluir meus dados para mantê-los atualizados. | Edição mantém validações; a exclusão é bloqueada se houver pedidos/contratos ativos. | UC03 |
| HU04 | Como **cliente**, quero cadastrar meus automóveis para que possam constar em contratos. | Placa (padrão antigo ou Mercosul) e matrícula únicas; só edito/excluo veículos meus. | UC04 |
| HU05 | Como **cliente**, quero criar um pedido de aluguel escolhendo automóvel e período (e, opcionalmente, crédito de um banco). | Datas coerentes; sem retirada no passado; carro indisponível no período é recusado; total = diárias × valor da diária; pedido nasce "Em análise". | UC05 |
| HU06 | Como **cliente**, quero visualizar o status dos meus pedidos. | Lista só os meus pedidos; mostra status, parecer do agente e contrato. | UC06, UC12 |
| HU07 | Como **cliente**, quero modificar um pedido ainda em análise. | Após modificar, o pedido volta para "Em análise" e o parecer anterior é descartado. | UC07 |
| HU08 | Como **cliente**, quero cancelar um pedido. | Permitido em "Em análise" e "Aprovado"; confirmação obrigatória. | UC08 |

## Agente (empresa ou banco)
| ID | História | Critérios de aceite | UC |
|---|---|---|---|
| HU09 | Como **agente**, quero avaliar financeiramente um pedido para aprovar ou reprovar. | Vejo renda total, valor do aluguel e % de comprometimento; parecer textual obrigatório; status vira "Aprovado" ou "Reprovado". | UC09 |
| HU10 | Como **agente**, quero modificar pedidos. | Modificação reabre a análise. | UC07 |
| HU11 | Como **agente**, quero executar o contrato de pedidos aprovados. | Defino se o automóvel fica como propriedade do agente ou do cliente; o proprietário do veículo é atualizado; pedido vira "Contratado". | UC10 |
| HU12 | Como **banco**, quero conceder crédito associado ao aluguel. | Só o banco escolhido no pedido executa o contrato com crédito; valor financiado ≤ total; parcela pela Tabela Price. | UC11 |
| HU13 | Como **agente**, quero gerenciar clientes e automóveis (empresas, bancos e clientes). | CRUD completo com busca; exclusão bloqueada se houver vínculo ativo. | UC03, UC04 |

## Regras de negócio
- RN01 Rendimentos: no mínimo 1 e no máximo 3 por cliente.
- RN02 Um automóvel não pode ter dois pedidos ativos (Em análise, Aprovado ou Contratado) com períodos sobrepostos.
- RN03 Diárias contam início e fim (10 a 12 = 3 diárias).
- RN04 Contrato com crédito só pode ser executado pelo banco indicado no pedido.
- RN05 A propriedade do automóvel é registrada conforme o tipo de contrato (cliente, empresa ou banco).
