import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch, Timestamp } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Module content that will be saved to Firebase
const MODULE_CONTENTS: Record<string, Record<string, string>> = {
  'intro': {
    title: '1. Introdução',
    content: `# 1. Introdução

## 1.1 Estrutura do documento
Cada teste aqui apresentado possui: pré-condição (condições mínimas para o que teste ocorra), execução (etapas enumeradas para realização dos testes) e pós-condição (resultado esperado).

## 1.2 Sobre os testes
Os testes aqui descritos são feitos através da interface gráfica do MDC, conhecida como ORCA. Todos os testes também pressupõem a existência de:
- Um AP;
- Um medidor/controlador devidamente associado a esse AP;
- Ambos os equipamentos devem estar ligados e disponíveis na rede (exceto em casos onde o teste diga o contrário);
- (Opcional) Um testador com certificação válida NR-10;
- (Opcional) Para realizar testes de alarmes, o equipamento de teste deve estar previamente configurado com essa funcionalidade.`
  },
  'dispositivos': {
    title: '2. Dispositivos',
    content: `# 2. Dispositivos

## 2.1 Posição dos MMs / Gerenciamento de Rede
Neste capítulo é demonstrado como identificar a posição dos medidores dentro da caixa e o monitoramento da qualidade de comunicação.

## 2.2 Execução de Monitoramento:
1. No menu lateral acesse: Assets > Registration > Terminals;
2. Clique no botão de visualização da caixa;
3. Uma tela com a lista dos medidores e a sua posição dentro da caixa será exibida na tela.

## 2.3 Medição de Qualidade (RSSI e LQI):
- RSSI: Medição da potência presente em um sinal de rádio recebido. Dispositivos acima de -90dBm são satisfatórios.
- LQI: Qualidade dos pacotes de dados recebidos. Dispositivos com indicador acima de 85 são satisfatórios.`
  },
  'corte-religue': {
    title: '3. Corte e Religue',
    content: `# 3. Corte e Religue

Aqui é apresentada a funcionalidade de abertura e fechamento de relé (corte e religa).

## 3.1 Corte (Abertura de Relé)
- Pré-condição: Ao menos um dos medidores deve estar com o relé fechado (Connected).
- Execução:
  1. Abrir o ORCA;
  2. No menu lateral, acesse: Operational Commands > Disconnect/Connect;
  3. Selecione o medidor e envie o comando de desconexão.
- Pós-condição: Em caso de sucesso, o status mudará para Disconnected.

## 3.2 Religa (Fechamento de Relé)
- Pré-condição: Ao menos um dos medidores deve estar com o relé aberto (Disconnected).
- Execução:
  1. Abrir o ORCA;
  2. No menu lateral, acesse: Operational Commands > Disconnect/Connect;
  3. Selecione o protocolo e envie o comando de conexão.
- Pós-condição: Em caso de sucesso, o status mudará para Connected.`
  },
  'leitura-demanda': {
    title: '4. Leitura sob Demanda',
    content: `# 4. Leitura sob Demanda

- Pré-condição: Medidor online e devidamente registrado no MDC.
- Execução:
  1. Navegue até: Operational Commands > On Demand Reading;
  2. Selecione o Node apropriado na árvore de ativos;
  3. Escolha o Protocol Type;
  4. Insira o Meter No.;
  5. Selecione os parâmetros que deseja ler (Energia, Tensão, Corrente, etc);
  6. Clique em Read ou On Demand Reading.
- Pós-condição: O resultado da leitura sob demanda será exibido em tempo real com os valores lidos com sucesso.`
  },
  'alarmes': {
    title: '5. Alarmes e Eventos',
    content: `# 5. Alarmes e Eventos

Procedimentos para validação e consulta de eventos e alarmes reportados pelo equipamento ao sistema.

- Execução:
  1. Acesse o menu de Alarmes/Eventos no ORCA;
  2. Filtre pelo Terminal/Medidor específico;
  3. Provoque o alarme fisicamente (ex: tampa aberta, se aplicável e seguro) ou simule via comando;
  4. Verifique o recebimento do pacote de alarme no sistema com o Timestamp correto.
- Pós-condição: O alarme provocado deve constar na tabela de alarmes ativos com o status correto.`
  },
  'parametrizacao': {
    title: '6. Parametrização do Sistema',
    content: `# 6. Parametrização do Sistema

Fluxos de leitura da parametrização atual e envio de nova configuração.

## 6.1 Leitura de Parâmetros
- Permite ler os parâmetros atuais gravados no Terminal/Medidor.

## 6.2 Envio de Configuração
- Execução:
  1. No menu lateral acesse: Configuration > Parameters Configuration > Terminal/Meter Parameters;
  2. Selecione o protocolo correspondente;
  3. Selecione o equipamento de teste na lista;
  4. Selecione a categoria da parametrização e configure as opções à direita;
  5. Envie o comando.
- Pós-condição: Uma tela mostrando o sucesso da operação será exibida e gravada.`
  },
  'relatorios': {
    title: '7. Relatórios e Análises',
    content: `# 7. Relatórios e Análises

Procedimentos para consulta e extração de relatórios do ambiente MDC/LESS.

- Pré-condição: Ao menos um medidor cadastrado, com task de push de dados configurada e comunicando.
- Execução:
  1. No menu lateral acesse: Reports > Readings;
  2. Selecione o período da consulta (Time/Date);
  3. Selecione o nó que será consultado (Node);
  4. Selecione o tipo de leitura (ex: Energy, Billing, Load Profile);
  5. Clique em pesquisar/exportar.
- Pós-condição: Os dados do relatório devem ser gerados em tabela com a opção de exportação em CSV ou Excel.`
  },
  'diagnosticos': {
    title: '8. Ferramentas de Diagnóstico',
    content: `# 8. Ferramentas de Diagnóstico

Ferramentas e procedimentos úteis para reunir informações e realizar testes individuais de conectividade dos dispositivos de rede.

## 8.1 Operação de Diagnóstico (Ping)
- Execução:
  1. Acesse: Network Management > Device Manage;
  2. Clique no botão de Diagnóstico (Ping) na coluna Action do dispositivo específico;
  3. Verifique a taxa de perda de pacotes.
- Pós-condição: O diagnóstico ideal deve resultar em 0% de perda de pacotes (Packet Loss).

## 8.2 Análise Estática de Rede
- Exibição de informações geográficas, alarmes ativos, nós filhos e medições históricas de qualidade para diagnóstico rápido de problemas em campo.`
  }
};

const TESTBOOK_IDS = ['pantheon-ng', 'streetlight', 'zeus'];

async function migrateModuleContents() {
  try {
    console.log('🌱 Starting module content migration to Firebase...\n');

    const batch = writeBatch(db);

    // For each testbook
    for (const testbookId of TESTBOOK_IDS) {
      console.log(`📦 Migrating content for testbook: ${testbookId}`);

      // For each module
      for (const [moduleId, moduleData] of Object.entries(MODULE_CONTENTS)) {
        // Create reference to: testbooks/{testbookId}/modules/{moduleId}
        const moduleRef = doc(db, 'testbooks', testbookId, 'modules', moduleId);

        batch.set(moduleRef, {
          id: moduleId,
          testbookId: testbookId,
          title: moduleData.title,
          content: moduleData.content,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          images: [],
          alerts: []
        });

        console.log(`  ✅ Module: ${moduleId}`);
      }
    }

    await batch.commit();
    console.log('\n✅ All module contents migrated successfully!');
    console.log('\nStructure created:');
    console.log('testbooks/');
    console.log('  ├── pantheon-ng/');
    console.log('  │   └── modules/ (8 modules)');
    console.log('  ├── streetlight/');
    console.log('  │   └── modules/ (8 modules)');
    console.log('  └── zeus/');
    console.log('      └── modules/ (8 modules)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error migrating module contents:', error);
    process.exit(1);
  }
}

migrateModuleContents();
