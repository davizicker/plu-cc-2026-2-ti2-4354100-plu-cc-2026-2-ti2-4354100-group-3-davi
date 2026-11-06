# Modelagem do Sistema

Fontes PlantUML em [`fontes/`](fontes) e imagens renderizadas em [`diagramas/`](diagramas). Para regenerar:
`java -jar plantuml.jar -tpng fontes/*.puml -o ../diagramas`.

## 1. Casos de Uso
![Casos de uso](diagramas/casos-de-uso.png)

## 2. Histórias de Usuário
Veja [historias-de-usuario.md](historias-de-usuario.md).

## 3. Diagrama de Classes
![Classes](diagramas/diagrama-classes.png)

Mapeamento para o JSON Server (`db.json`): `clientes` (com `rendimentos[]` embutidos), `agentes` (`tipo` = `empresa` | `banco`), `automoveis` (`proprietarioTipo` + `proprietarioId`), `pedidos` (com `parecer` e `credito` embutidos) e `contratos` (com `credito` embutido).

## 4. Diagrama de Pacotes (Visão Lógica)
![Pacotes](diagramas/diagrama-pacotes.png)

## 5. Diagrama de Componentes
![Componentes](diagramas/diagrama-componentes.png)

## 6. Diagramas complementares
Estados do pedido:

![Estados](diagramas/estados-pedido.png)

Sequência do pedido ao contrato:

![Sequência](diagramas/sequencia-pedido-contrato.png)

## Histórico de revisões
| Versão | Alteração |
|---|---|
| 1.0 | Modelos iniciais e primeira implementação. |
| 1.1 | Regra de disponibilidade por período e "modificação reabre análise" incluídas nos modelos após a implementação do protótipo. |
