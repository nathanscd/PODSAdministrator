import { CheckCircle2 } from "lucide-react";
import { useFavicon, useTitle } from "../../hooks/useTitle";
import { useTestbookPDF } from "../../hooks/useTestbookPDF";
import TestbookPageLayout, {
  AlertBox,
  ImagePlaceholder,
} from "../../components/Testbook/TestbookPageLayout";

export default function PantheonTestbook() {
  useTitle("Pantheon-NG - Testbook");
  useFavicon("/testbooks/Testbook.png");
  const { isExporting, pdfRef, handleExportPDF } = useTestbookPDF();

  const contentData = [
    {
      id: "intro",
      title: "1. Introdução",
      content: (
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              1.1 Estrutura do documento
            </h3>
            <p className="text-[var(--text-secondary)] leading-relaxed text-base md:text-lg">
              Cada teste aqui apresentado possui: <strong>pré-condição</strong>{" "}
              (condições mínimas para o que teste ocorra),{" "}
              <strong>execução</strong> (etapas enumeradas para realização dos
              testes) e <strong>pós-condição</strong> (resultado esperado).
            </p>
            <p className="text-[var(--text-secondary)] leading-relaxed text-base md:text-lg">
              Alguns testes também possuirão notações de dicas, ou erros
              conforme os padrões abaixo:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <AlertBox type="tip" title="Dica">
                Esta é a marcação para indicar dicas na hora da realização de um
                teste.
              </AlertBox>
              <AlertBox type="info" title="Info">
                Esta é a marcação para indicar informações adicionais.
              </AlertBox>
              <AlertBox type="warning" title="Atenção">
                Esta é a marcação para indicar pontos de atenção com relação ao
                teste ou resultado esperado.
              </AlertBox>
              <AlertBox type="error" title="Erro">
                Esta é a marcação para indicar problemas na documentação.
              </AlertBox>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              1.2 Sobre os testes
            </h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Os testes aqui descritos são feitos através da interface gráfica
              do MDC, conhecida como ORCA. Todos os testes também pressupõem a
              existência de:
            </p>
            <ul className="space-y-3 mt-4">
              {[
                "Um AP;",
                "Um pantheon devidamente associado a esse AP;",
                "Ambos os equipamentos devem estar ligados e disponíveis na rede (exceto em casos onde o teste diga o contrário);",
                "(Opcional) Um testador com certificação válida NR-10, ou dispor de profissional com essa certificação para manipulação física do equipamento;",
                "(Opcional) Para realizar testes de alarmes, o equipamento de teste deve estar previamente configurado com essa funcionalidade.",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 p-4 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-lg"
                >
                  <CheckCircle2
                    size={16}
                    className="text-[var(--accent-color)] shrink-0 mt-0.5"
                  />
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "dispositivos",
      title: "2. Dispositivos",
      content: (
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              2.1 Posição dos MMs
            </h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Neste capítulo será demonstrado como identificar a posição dos
              medidores dentro da caixa Pantheon V4.
            </p>

            <AlertBox type="info" title="Pré-condição">
              Ao menos uma caixa com um medidor cadastrado e comunicando no
              sistema.
            </AlertBox>

            <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-6">
              Execução:
            </h4>
            <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
              <li>
                No menu lateral acesse:{" "}
                <strong className="text-[var(--accent-color)]">
                  Assets &gt; Registration &gt; Terminals
                </strong>
                ;
              </li>
              <li>Clique no botão de visualização da caixa;</li>
              <li>
                Uma tela com a lista dos medidores e a sua posição dentro da
                caixa será exibida na tela.
              </li>
            </ul>

            <ImagePlaceholder
              label="Assets"
              src="/testbooks/pantheon/dispositivos.png"
            />

            <ImagePlaceholder
              label="Terminals"
              src="/testbooks/pantheon/dispositivos2.png"
            />

            <ImagePlaceholder
              label="Positions"
              src="/testbooks/pantheon/dispositivos3.png"
            />
          </div>
        </div>
      ),
    },
    {
      id: "corte-religue",
      title: "3. Corte/Religue",
      content: (
        <div className="space-y-8">
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Aqui será apresentada a funcionalidade de abertura/fechamento de
            relé (corte/religa). Para a execução do comando, é importante que
            saibamos o estado atual do módulo que será operado. Por isso, é
            recomendada a leitura do{" "}
            <strong>Apêndice A - Como ler o estado do relé</strong>.
          </p>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              3.1 Corte
            </h3>
            <AlertBox type="info" title="Pré-condição">
              Ao menos um dos MM deve estar com relé fechado ou{" "}
              <strong>Connected</strong>.
            </AlertBox>

            <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-4">
              Execução:
            </h4>
            <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
              <li>Abrir o ORCA;</li>
              <li>
                No menu lateral acesse{" "}
                <strong className="text-[var(--accent-color)]">
                  Operational Commands &gt; Disconnect/Connect
                </strong>
                ;
              </li>
              <li>Selecione o medidor e envie o comando de desconexão.</li>
            </ul>
            <ImagePlaceholder
              label="op commands"
              src="/testbooks/pantheon/corte.png"
            />

            <ImagePlaceholder
              label="select"
              src="/testbooks/pantheon/select.png"
            />

            <ImagePlaceholder
              label="result"
              src="/testbooks/pantheon/result.png"
            />

            <AlertBox type="tip" title="Pós-condição">
              Uma tela com a lista dos módulos selecionados aparecerá com o
              progresso. Em caso de sucesso, a mensagem retornará{" "}
              <strong>Disconnect Success</strong>. Ao realizar a leitura do
              estado, ele aparecerá Aberto ou <strong>Disconnected</strong>.
            </AlertBox>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              3.2 Religa
            </h3>
            <AlertBox type="info" title="Pré-condição">
              Ao menos um dos MM deve estar com relé Aberto ou{" "}
              <strong>Disconnected</strong>.
            </AlertBox>

            <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-4">
              Execução:
            </h4>
            <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
              <li>Abrir o ORCA;</li>
              <li>
                No menu lateral acesse{" "}
                <strong className="text-[var(--accent-color)]">
                  Operational Commands &gt; Disconnect/Connect
                </strong>
                ;
              </li>
              <li>
                Selecione o protocolo (ex: DLMS_G6_METER_V4) e envie o comando
                de conexão.
              </li>
            </ul>
            <ImagePlaceholder
              label="op commands"
              src="/testbooks/pantheon/religue.png"
            />

            <ImagePlaceholder
              label="select"
              src="/testbooks/pantheon/select.png"
            />

            <ImagePlaceholder
              label="result"
              src="/testbooks/pantheon/result-religue.png"
            />

            <AlertBox type="tip" title="Pós-condição">
              Em caso de sucesso, a mensagem retornará{" "}
              <strong>Connect Success</strong>. Ao realizar a leitura do estado,
              ele aparecerá <strong>Connected</strong>.
            </AlertBox>
          </div>
        </div>
      ),
    },
    {
      id: "leitura-demanda",
      title: "4. Leitura sob demanda",
      content: (
        <div className="space-y-6">
          <AlertBox type="info" title="Pré-condição">
            Medidor online e devidamente registrado no MDC.
          </AlertBox>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            A leitura sob demanda requer a seleção do protocolo correto e do
            Item de Dados (Data Item) desejado.
          </p>
          <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-4">
            Execução:
          </h4>
          <ul className="list-decimal list-inside space-y-3 text-[var(--text-secondary)] p-5 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-lg text-sm md:text-base">
            <li>
              Navegue até{" "}
              <strong>Operational Commands &gt; On Demand Reading</strong>;
            </li>
            <li>Selecione o Node apropriado na árvore de ativos;</li>
            <li>
              Escolha o <strong>Protocol Type</strong>;
            </li>
            <li>
              Insira o <strong>Meter No.</strong> (ou selecione na lista);
            </li>
            <li>
              Selecione os parâmetros que deseja ler (Energia, Tensão, Corrente,
              etc);
            </li>
            <li>
              Clique em <strong>Read</strong> ou{" "}
              <strong>On Demand Reading</strong>.
            </li>
          </ul>
          <ImagePlaceholder
            label="demand"
            src="/testbooks/pantheon/leitura_demanda.png"
          />

          <ImagePlaceholder
            label="select"
            src="/testbooks/pantheon/select-demand.png"
          />

          <ImagePlaceholder
            label="result"
            src="/testbooks/pantheon/result-demand.png"
          />
        </div>
      ),
    },
    {
      id: "data-hora",
      title: "5. Atualização de data e hora",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              5.1 Atualizar data e hora
            </h3>
            <AlertBox type="info" title="Pré-condição">
              Ao menos um dos MM deve estar online e comunicando com o sistema.
            </AlertBox>

            <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-4">
              Execução:
            </h4>
            <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
              <li>
                Abrir o ORCA e ir em{" "}
                <strong className="text-[var(--accent-color)]">
                  Operational Commands &gt; Time Synchronization
                </strong>
                ;
              </li>
              <li>Selecione o protocolo do pantheon (DLMS_G6_METER_V4);</li>
              <li>Selecione os medidores ou a caixa que receberá o comando;</li>
              <li>
                Clique no botão <strong>Synchronizing Time</strong>;
              </li>
              <li>
                Escolha entre <strong>Server Clock</strong> (horário do
                servidor) ou <strong>Customized Selection</strong> (horário
                manual);
              </li>
              <li>
                Clique em Ok e depois em <strong>Confirm</strong> para enviar o
                comando.
              </li>
            </ul>
            <ImagePlaceholder
              label="Print: Sincronização de Relógio (Time Sync)"
              src="/testbooks/pantheon/data_hora.png"
            />

            <AlertBox type="tip" title="Pós-condição">
              Uma tela com todos os módulos selecionados e o resultado da
              operação (Sucesso/Falha) será exibida.
            </AlertBox>
          </div>
        </div>
      ),
    },
    {
      id: "tela-lcd",
      title: "6. Tela LCD",
      content: (
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              6.1 Leitura
            </h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Verificação da configuração atual do display do medidor.
            </p>
            <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
              <li>
                Selecione o medidor e clique no botão para ler o que está sendo
                exibido na tela;
              </li>
              <li>
                O resultado da leitura deve ser equivalente ao que está sendo
                mostrado fisicamente no display.
              </li>
            </ul>
            <ImagePlaceholder
              label="Print: Leitura da Configuração do LCD"
              src="/testbooks/pantheon/leitura_lcd.png"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              6.2 Alterar o display
            </h3>
            <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)]">
              Execução:
            </h4>
            <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
              <li>Selecione o medidor que terá o display alterado;</li>
              <li>Selecione os itens que serão exibidos no display;</li>
              <li>
                A ordem de escolha dos itens será a ordem em que os mesmos serão
                exibidos na rotação automática da tela LCD;
              </li>
              <li>Confirme e envie a configuração.</li>
            </ul>
            <ImagePlaceholder
              label="Print: Alteração de Itens do Display"
              src="/testbooks/pantheon/alterar_lcd.png"
            />
            <AlertBox type="warning" title="Pós-condição">
              Cheque fisicamente na tela LCD do equipamento se os itens
              selecionados estão realmente sendo exibidos na ordem em que foram
              configurados.
            </AlertBox>
          </div>
        </div>
      ),
    },
    {
      id: "parametrizacao",
      title: "7. Parametrização",
      content: (
        <div className="space-y-8">
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Para parametrização, temos fluxos de leitura da parametrização atual
            e envio de nova configuração.
          </p>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              7.1 Leitura
            </h3>
            <p className="text-[var(--text-secondary)]">
              Permite ler os parâmetros atuais gravados no Terminal/Medidor.
            </p>
            <ImagePlaceholder
              label="Print: Tela de Leitura de Parâmetros"
              src="/testbooks/pantheon/leitura_parametros.png"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              7.2 Configuração
            </h3>
            <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)]">
              Execução:
            </h4>
            <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
              <li>
                No menu lateral acesse:{" "}
                <strong className="text-[var(--accent-color)]">
                  Configuration &gt; Parameters Configuration &gt; Terminal
                  Parameters
                </strong>
                ;
              </li>
              <li>Selecione o protocolo do pantheon (ex: DLMS_G6_DC_V4);</li>
              <li>
                Uma lista de equipamentos deve surgir; selecione o equipamento
                de teste;
              </li>
              <li>Selecione a categoria da parametrização;</li>
              <li>
                Uma lista de configuração aparecerá à direita (ex: seleção de
                alarmes a serem ativados);
              </li>
              <li>Envie o comando.</li>
            </ul>
            <ImagePlaceholder
              label="Print: Envio de Configuração de Parâmetros"
              src="/testbooks/pantheon/config_parametros.png"
            />
            <AlertBox type="tip" title="Pós-condição">
              Uma tela mostrando o sucesso da operação será exibida.
            </AlertBox>
          </div>
        </div>
      ),
    },
    {
      id: "tarifas",
      title: "8. Configuração de Tarifas",
      content: (
        <div className="space-y-8">
          <p className="text-[var(--text-secondary)] leading-relaxed">
            A configuração dos modelos tarifários segue um fluxo rigoroso de
            criação (Daily, Weekly, Seasonal, Holiday) para posterior aplicação.
          </p>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              8.1 Registrando um modelo tarifário
            </h3>

            <div className="ml-2 md:ml-4 space-y-6 border-l-2 border-[var(--border-color)] pl-4 md:pl-6">
              <div>
                <h4 className="font-bold text-lg md:text-xl text-[var(--text-primary)] mb-2">
                  8.1.1 Daily Template
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-[var(--text-secondary)]">
                  <li>
                    Acesse{" "}
                    <strong>
                      Configuration &gt; DLMS_G6_METER_V4 Tariffs Definitions
                    </strong>
                    ;
                  </li>
                  <li>
                    Selecione <strong>Daily Template</strong> e clique em Add;
                  </li>
                  <li>
                    Crie os períodos de tempo (Time Period List), horários e as
                    taxas aplicadas (Tariff Rate);
                  </li>
                  <li>Salve o modelo diário.</li>
                </ul>
                <ImagePlaceholder
                  label="Print: Daily Template"
                  src="/testbooks/pantheon/daily_template.png"
                />
              </div>

              <div>
                <h4 className="font-bold text-lg md:text-xl text-[var(--text-primary)] mb-2">
                  8.1.2 Weekly Template
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-[var(--text-secondary)]">
                  <li>
                    Selecione <strong>Weekly Template</strong> e clique em Add;
                  </li>
                  <li>Defina o nome do modelo semanal;</li>
                  <li>
                    Para cada dia da semana, selecione o{" "}
                    <strong>Daily Template</strong> criado anteriormente;
                  </li>
                  <li>Salve a operação.</li>
                </ul>
                <ImagePlaceholder
                  label="Print: Weekly Template"
                  src="/testbooks/pantheon/weekly_template.png"
                />
              </div>

              <div>
                <h4 className="font-bold text-lg md:text-xl text-[var(--text-primary)] mb-2">
                  8.1.3 Seasonal Template
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-[var(--text-secondary)]">
                  <li>
                    Selecione <strong>Seasonal Template</strong> e adicione um
                    novo;
                  </li>
                  <li>
                    Defina data de início e associe ao{" "}
                    <strong>Weekly Template</strong> criado;
                  </li>
                  <li>Salve.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-lg md:text-xl text-[var(--text-primary)] mb-2">
                  8.1.4 Holiday Template (Common e Special)
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-[var(--text-secondary)]">
                  <li>
                    Selecione <strong>Holiday</strong> e clique em Add no campo
                    Common ou Special Holiday;
                  </li>
                  <li>
                    Defina o nome, a data fixa (ou recorrente) e aplique o{" "}
                    <strong>Daily Template</strong> específico para o feriado.
                  </li>
                </ul>
                <ImagePlaceholder
                  label="Print: Holiday Template"
                  src="/testbooks/pantheon/holiday_template.png"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              8.2 Selecionando um modelo tarifário
            </h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Para aplicar o modelo criado, selecione o medidor desejado e
              clique no botão <strong>Current Tariff</strong> ou envie a
              parametrização tarifária compilada para o Node.
            </p>
            <ImagePlaceholder
              label="Print: Aplicação do Modelo Tarifário (Current Tariff)"
              src="/testbooks/pantheon/current_tariff.png"
            />
            <AlertBox type="tip" title="Resultado">
              A tela exibirá o resultado da requisição de parametrização
              tarifária com status de sucesso.
            </AlertBox>
          </div>
        </div>
      ),
    },
    {
      id: "relatorios",
      title: "9. Relatórios",
      content: (
        <div className="space-y-6">
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Neste capítulo será apresentada a tela de leituras do ambiente (MDC
            Reports).
          </p>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              9.1 Leituras
            </h3>
            <AlertBox type="info" title="Pré-condição">
              Ao menos um medidor cadastrado, com task de push de dados
              configurada e comunicando corretamente no sistema.
            </AlertBox>

            <h4 className="font-bold text-base md:text-lg text-[var(--text-primary)] mt-4">
              Execução:
            </h4>
            <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
              <li>
                No menu lateral acesse{" "}
                <strong className="text-[var(--accent-color)]">
                  Reports &gt; Readings
                </strong>
                ;
              </li>
              <li>Selecione o período da consulta (Time/Date);</li>
              <li>Selecione o nó que será consultado (Node);</li>
              <li>
                Selecione o tipo de leitura (ex: Energy, Billing, Load Profile);
              </li>
              <li>Clique em pesquisar/exportar.</li>
            </ul>
            <ImagePlaceholder
              label="Print: Tela de Reports > Readings"
              src="/testbooks/pantheon/relatorios.png"
            />
          </div>
        </div>
      ),
    },
    {
      id: "alarmes",
      title: "10. Alarmes",
      content: (
        <div className="space-y-6">
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Procedimentos para validação e consulta de eventos e alarmes
            reportados pelo equipamento ao sistema.
          </p>
          <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
            <li>Acesse o menu de Alarmes/Eventos no ORCA;</li>
            <li>Filtre pelo Terminal/Medidor específico;</li>
            <li>
              Provoque o alarme fisicamente (ex: tampa aberta, se aplicável e
              seguro) ou simule via comando;
            </li>
            <li>
              Verifique o recebimento do pacote de alarme no sistema com o
              Timestamp correto.
            </li>
          </ul>
          <ImagePlaceholder
            label="Print: Tela de Alarmes Recebidos"
            src="/testbooks/pantheon/alarmes.png"
          />
        </div>
      ),
    },
    {
      id: "apendice",
      title: "11. Apêndice",
      content: (
        <div className="space-y-6">
          <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
            11.1 A - Como ler o estado do relé
          </h3>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Saber o estado atual do relé é crucial antes de enviar comandos de
            Corte ou Religue.
          </p>
          <ul className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] text-sm md:text-base pl-2">
            <li>Vá na tela de comandos operacionais de leitura sob demanda;</li>
            <li>
              Busque pelo Data Item referente ao{" "}
              <strong>
                Status do Relé (Relay Status / Disconnect Control)
              </strong>
              ;
            </li>
            <li>Realize a leitura;</li>
            <li>
              Interprete o resultado numérico/booleano retornado na tabela (ex:
              0 = Conectado, 1 = Desconectado).
            </li>
          </ul>
          <ImagePlaceholder
            label="Print: Leitura do Data Item de Status do Relé"
            src="/testbooks/pantheon/status_rele.png"
          />
        </div>
      ),
    },
    {
      id: "changelog",
      title: "12. Changelog",
      content: (
        <div className="space-y-6">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-5 md:p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4 mb-4">
              <h3 className="text-lg md:text-xl font-black text-[var(--text-primary)]">
                v1.0.0
              </h3>
              <span className="px-3 py-1 bg-[var(--accent-color)]/10 text-[var(--accent-color)] rounded-md text-xs font-bold border border-[var(--accent-color)]/20">
                FEVEREIRO/2026
              </span>
            </div>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />{" "}
                Criação inicial do Testbook Pantheon V4.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />{" "}
                Adição de fluxos de Corte e Religue.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />{" "}
                Mapeamento de Telas LCD e Parametrização Tarifária.
              </li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  return (
    <TestbookPageLayout
      title="Pantheon V4"
      exportTitle="Testbook - Pantheon V4"
      pdfRef={pdfRef}
      isExporting={isExporting}
      handleExportPDF={handleExportPDF}
      contentData={contentData}
      showLanguageSwitcher={false}
    />
  );
}
