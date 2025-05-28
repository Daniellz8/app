Objetivo: Fornecer uma especificação clara e detalhada do sistema de gamificação a ser implementado, incluindo as mecânicas de pontuação, progressão e recompensas. Este documento é destinado à equipe de desenvolvimento do sistema.

1. Estrutura Básica do Sistema

  - Dias de Trabalho (Simulação): Apenas os dias pares do mês serão considerados para o progresso simulado. Isso significa que, para fins de cálculo, o progresso será medido em "dias de trabalho" simulados, que correspondem aos dias pares do calendário.
  - XP (Pontos de Experiência): Representam o conhecimento teórico adquirido. O XP é a métrica principal para medir o progresso no aprendizado.
      - Ganho: 100 XP por cada aula teórica concluída. Cada aula teórica completa contribui com 100 XP para o total.
  - Receita (Simulada): Representa o valor gerado pelas atividades práticas. A receita simulada é uma forma de quantificar o resultado do trabalho prático.
      - "Serviços de Debug" (Exercícios):
          - 30 exercícios concluídos ("Certificado"): +R$ 50,00 (total). Ao completar 30 exercícios, o valor total ganho é de R$ 50,00.
          - Ao atingir 50 exercícios concluídos ("Autoridade"): +R$ 100,00 adicionais, totalizando R$ 150,00. Ao completar 50 exercícios, o valor total ganho é de R$ 150,00.
      - "Projetos de Desenvolvimento" (Projetos de Portfólio):
          - Cada projeto concluído: +R$ 300,00. Cada projeto finalizado contribui com R$ 300,00 para a receita.
  - Avaliação da Empresa: Medida por um sistema de 10 estrelas, diretamente ligada ao número de Seguidores. A avaliação da empresa é uma representação visual do progresso, baseada no número de seguidores.
  - Seguidores: Conquistados através do acúmulo de XP. Os seguidores são uma forma de medir a "popularidade" ou "reconhecimento" da empresa.
      - A cada 1000 XP ganhos: +42 Seguidores. A cada 1000 XP acumulados, 42 novos seguidores são adicionados.
  - Bônus por Projeto Concluído: Recompensa adicional pelo esforço em projetos. Um bônus extra para incentivar a conclusão de projetos.
      - Por projeto concluído: +1000 XP e +50 Seguidores. Além da receita, cada projeto concluído adiciona 1000 XP e 50 seguidores.
  - Recompensas Reais: A receita simulada pode ser convertida em fundos para aquisição de equipamentos. Uma forma de converter o progresso simulado em benefícios reais.

2. Detalhamento dos Ganhos

2.  1. Ganho de XP

  - Estudo Teórico:
    XP_{ganho por aula} = 100 XP
    Se o número de aulas concluídas for $N_{aulas}$, o total de XP ganho por estudo teórico será:
    XP_{teórico total} = N_{aulas} \times 100 XP
    Exemplo: Se 10 aulas forem concluídas, o XP total será 10 * 100 = 1000 XP.
  - Bônus por Projetos:
    XP_{bônus por projeto} = 1000 XP
    Se o número de projetos concluídos for $N_{projetos}$, o total de XP de bônus será:
    XP_{bônus total} = N_{projetos} \times 1000 XP
    Exemplo: Se 3 projetos forem concluídos, o XP total de bônus será 3 * 1000 = 3000 XP.
  - XP Total:
    XP_{total} = XP_{teórico total} + XP_{bônus total}
    Exemplo: Se o XP teórico for 2000 e o XP de bônus for 3000, o XP total será 2000 + 3000 = 5000 XP.

2.  2. Conquista de Seguidores (Avaliação)

  - Seguidores por XP:
    Seguidores_{por 1000 XP} = 42 Seguidores
    O número de seguidores ganhos pelo XP total será:
    Seguidores_{XP} = \frac{XP_{total}}{1000} \times 42
    Exemplo: Se o XP total for 5000, os seguidores ganhos por XP serão (5000 / 1000) * 42 = 210 seguidores.
  - Seguidores por Bônus de Projeto:
    Seguidores_{bônus por projeto} = 50 Seguidores
    O número total de seguidores de bônus será:
    Seguidores_{bônus total} = N_{projetos} \times 50 Seguidores
    Exemplo: Se 3 projetos forem concluídos, o total de seguidores de bônus será 3 * 50 = 150 seguidores.
  - Total de Seguidores:
    Seguidores_{total} = Seguidores_{XP} + Seguidores_{bônus total}
    Exemplo: Se os seguidores por XP forem 210 e os seguidores de bônus forem 150, o total será 210 + 150 = 360 seguidores.
  - Avaliação (Estrelas):
      - Meta para 10 estrelas: 3086 Seguidores.
      - Percentual de avaliação por seguidor: $\frac{100%}{3086} \approx 0.  0324%$ por seguidor.
      - Número de estrelas (aproximado): $\frac{Seguidores_{total}}{308.  6}$
        Exemplo: Se o total de seguidores for 360, o número de estrelas será aproximadamente 360 / 308.  6 ≈ 1.  17 estrelas. Isso significa que, com 360 seguidores, a empresa teria pouco mais de 1 estrela.

2.  3. Geração de Receita (Simulada)

  - Receita por Exercícios:
    Receita_{30 exercícios} = R$ 50,00
    Receita_{50 exercícios} = R$ 150,00 (total)
  - Receita por Projetos:
    Receita_{por projeto} = R$ 300,00
    Se $N_{projetos}$ for o número de projetos concluídos, a receita total de projetos será:
    Receita_{projetos total} = N_{projetos} \times 300,00
    Exemplo: Se 3 projetos forem concluídos, a receita total será 3 * 300 = R$ 900,00.
  - Receita Total (Simulada):
    A receita total dependerá do número de exercícios e projetos concluídos. Para calcular a receita total, some a receita dos exercícios com a receita dos projetos.

3. Custos Mensais (Simulados)

Custo_{curso} = R$ 120,00

Custo_{internet} = R$ 180,00

Outros_{custos} = R$ 300,00

Custo_{mensal total} = R$ 120,00 + R$ 180,00 + R$ 300,00 = R$ 600,00

O custo mensal total fixo é de R$ 600,00.

4. "Loja" de Recompensas (Conversão para Real)

  - Taxa de Conversão: A cada R$ 1000,00 de receita simulada, R$ 200,00 são disponibilizados para gastos reais em equipamentos.
    Fator de Conversão = \frac{R$ 200,00_{real}}{R$ 1000,00_{simulado}} = 0.  2
  - Recompensa Real:
    Recompensa_{real} = Receita Total (Simulada) \times 0.  2
    Exemplo: Se a receita total simulada for R$ 1500,00, a recompensa real será 1500 * 0.  2 = R$ 300,00.

5. Exemplo de Projeção de Progresso (2 Anos)

Considerando um ritmo disciplinado de estudo:

  - Aulas teóricas por dia de trabalho: 15 aulas
  - Dias de trabalho por mês (aproximado): 15 dias (considerando apenas os pares)

Aulas_{por mês} = 15 aulas/dia \times 15 dias/mês = 225 aulas/mês

XP_{mensal teórico} = 225 aulas/mês \times 100 XP/aula = 22500 XP/mês

Ao longo de 2 anos (24 meses):

XP_{total teórico} = 22500 XP/mês \times 24 meses = 540000 XP

Seguidores_{XP total} = \frac{540000}{1000} \times 42 = 22680 Seguidores

Se considerarmos também a conclusão de, por exemplo, 2 projetos por mês:

XP_{bônus total (2 anos)} = (2 projetos/mês \times 24 meses) \times 1000 XP/projeto = 48000 XP

Seguidores_{bônus total (2 anos)} = (2 projetos/mês \times 24 meses) \times 50 Seguidores/projeto = 2400 Seguidores

XP_{total geral} = 540000 + 48000 = 588000 XP

Seguidores_{total geral} = 22680 + 2400 = 25080 Seguidores

Avaliação aproximada: $\frac{25080}{308.  6} \approx 81.  27$ estrelas (isso indica que a meta de 10 estrelas precisaria ser ajustada ou o ganho de seguidores por XP aumentado para essa projeção).

6. Implementação no Sistema

A equipe de desenvolvimento precisará criar mecanismos para:

  - Registrar o número de aulas teóricas concluídas.
  - Registrar o número de exercícios ("Serviços de Debug") concluídos.
  - Registrar o número de projetos ("Projetos de Desenvolvimento") concluídos.
  - Calcular e exibir:
      - XP total ganho.
      - Número total de seguidores.
      - Avaliação atual (visualização de 10 estrelas).
      - Receita simulada total.
      - Saldo disponível para recompensas reais.
  - Um sistema para registrar as recompensas resgatadas.

Este documento detalha o sistema de gamificação, incluindo a estrutura básica, o cálculo de ganhos (XP, seguidores, receita), os custos mensais simulados, a conversão para recompensas reais e um exemplo de projeção de progresso. Ele fornece todas as informações necessárias para a implementação do sistema.
