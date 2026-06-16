# Regex Formatter

O **Regex Formatter** é um formatador e identador genérico simples e altamente flexível para o VS Code e Antigravity. Ele permite configurar regras de formatação para qualquer linguagem de programação através de um arquivo JSON simples (`.regex-formatter.json` na raiz do seu projeto), dispensando configurações em arquivos XML complexos ou dependências pesadas.

A extensão também vem com configurações padrão pré-definidas (hardcoded) para **Java, C#, Go, JavaScript, TypeScript e JSON**, funcionando imediatamente ao ser instalada.

---

## Como Começar

1. **Instale a extensão** no seu editor (VS Code ou Antigravity).
2. **Abra a pasta do seu projeto/workspace**.
3. **Crie o arquivo de configuração**:
   - Abra o Command Palette com o atalho `Ctrl + Shift + P` (ou `Cmd + Shift + P` no macOS).
   - Digite `Regex Formatter: Create Configuration File` e pressione `Enter`.
   - Um arquivo `.regex-formatter.json` com configurações de exemplo completas será criado automaticamente na raiz do seu workspace.
4. **Formate seu código**:
   - Abra qualquer arquivo suportado e use o atalho padrão de formatação (`Shift + Alt + F` no Windows/Linux, `Shift + Option + F` no macOS) ou clique com o botão direito e selecione **Format Document**.

---

## Desenvolvimento

### Pré-requisitos

- **Linux** com `curl` e `bash`
- [VS Code](https://code.visualstudio.com/) ou [Antigravity](https://antigravity.dev/) (para depurar/executar a extensão)

> O comando `make install` já cuida de instalar o [nvm](https://github.com/nvm-sh/nvm), o [Node.js](https://nodejs.org/) v20 e as dependências do npm automaticamente.

### Instalando dependências

```bash
make install
```

Esse comando irá:
1. Instalar o **nvm** (se ainda não estiver instalado)
2. Instalar e ativar o **Node.js v20** via nvm
3. Executar `npm install` para baixar as dependências do projeto

### Compilando o projeto

O projeto é escrito em TypeScript e precisa ser compilado para JavaScript antes de ser executado.

```bash
make compile
```

Para compilar automaticamente a cada alteração de arquivo (modo watch):

```bash
make watch
```

### Executando / Depurando

**Via Makefile** — abre uma nova janela do VS Code/Antigravity com a extensão carregada em modo de desenvolvimento sobre a pasta `test-project`:

```bash
make debug
```

> Para usar outro editor compatível (ex: Cursor), sobrescreva a variável `VSCODE_BIN`:
> ```bash
> make debug VSCODE_BIN=cursor
> ```

**Via VS Code/Antigravity** — pressione `F5` (ou use o menu *Run > Start Debugging*). O launch configuration `Run Extension` já está configurado em `.vscode/launch.json`.

### Lint e Testes

```bash
make lint    # Executa o ESLint
make test    # Executa os testes unitários
```

### Empacotando como `.vsix`

Para gerar o pacote instalável da extensão (`.vsix`):

```bash
make package
```

### Limpeza

Remove os arquivos JS compilados da pasta `out/`:

```bash
make clean
```

---

## Como Usar

1. Crie um arquivo chamado `.regex-formatter.json` na pasta raiz do seu projeto.
2. Defina as regras de formatação em formato de um array JSON contendo blocos de configuração.
3. Execute o comando de formatação do VS Code (`Shift + Alt + F` no Windows/Linux, `Shift + Option + F` no macOS ou pelo menu de contexto "Format Document").

Você também pode criar um arquivo de configuração inicial rapidamente usando o comando:
**Regex Formatter: Create Configuration File** através do Command Palette do editor.

---

## Opções de Configuração

Cada bloco de configuração no arquivo `.regex-formatter.json` é um objeto com as seguintes chaves:

### Configuração Geral do Bloco

| Campo | Tipo | Valor Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `fileExtensions` | `string[]` | *Obrigatório* | Lista de extensões de arquivo que este bloco irá formatar (ex: `["java", "cs"]`, `["go"]`). |
| `indentSize` | `number` | `4` | Número de espaços usados para a indentação padrão de novos blocos/chaves. |
| `continuationIndentSize` | `number` | `8` | Número de espaços adicionais para linhas que continuam uma instrução da linha anterior (linhas quebradas). |
| `bracesStyle` | `string` | `"sameLine"` | Controla onde a chave de abertura `{` deve ficar. Valores válidos: `"sameLine"` (mesma linha) ou `"newLine"` (linha de baixo). |
| `breakBraceBlocks` | `boolean` | `true` | Se `true`, força a quebra de linha de declarações/instruções que estão na mesma linha que chaves `{` ou `}` (ex: `{ public int a;` ou `findOne(); }`). Evita quebrar inicializadores de array (que não possuem `;`). |
| `indentOnly` | `boolean` | `false` | Se definido como `true`, o formatador apenas ajustará a indentação e os recuos de cada linha, sem alterar onde as linhas quebram. |
| `forceReformat` | `boolean` | `false` | Se `true`, junta e desfaz quaisquer quebras de linha manuais em caracteres de quebra de linha antes de aplicar novamente as quebras conforme as regras ativas, forçando a reformatação completa. |
| `keepBlankLines` | `boolean` | `true` | Se `true` (padrão), preserva as linhas em branco e espaços vazios entre declarações do código. Se `false`, remove todas as linhas vazias do arquivo. |
| `completeLinePatterns` | `string[]` | `[]` | Lista de expressões regulares que identificam linhas que devem ser tratadas como "completas". Útil para que anotações/decorators (ex: `["^\\s*@"]` para Java/TS) não provoquem recuos de continuação indesejados ou se colapsem com a próxima linha. |

---

### Quebra de Linha Baseada em Caracteres (`lineBreakOnCharacters`)

Esta propriedade recebe uma lista de objetos que definem regras para quebrar linhas automaticamente ao encontrar determinados caracteres (por exemplo, quebrar em chamadas encadeadas de métodos com `.`).

| Subcampo | Tipo | Descrição |
| :--- | :--- | :--- |
| `char` | `string` | O caractere que aciona a quebra de linha (ex: `"."` ou `","`). |
| `position` | `string` | Onde a quebra de linha deve ser inserida em relação ao caractere: <br>• `"before"`: Quebra a linha *antes* do caractere (ex: `.map(...)` começa na nova linha - comum em Java). <br>• `"after"`: Quebra a linha *depois* do caractere (ex: `.\n` - exigido em Go). |
| `requireParenthesis` | `boolean` | (Opcional, apenas para caractere `"."`) Se definido como `true` (padrão), o ponto só quebra a linha se for precedido por um parêntese de fechamento `)` (ex: quebra em métodos encadeados, mas não em chamadas estáticas como `System.out`). Se definido como `false`, quebra em qualquer ponto (modo agressivo). |
| `beforePattern` | `string` | (Opcional) Expressão regular que deve coincidir imediatamente antes do caractere configurado para que a quebra ocorra (ex: `(?:select|where|execute)\\(\\)`). |
| `afterPattern` | `string` | (Opcional) Expressão regular que deve coincidir imediatamente após o caractere configurado para que a quebra ocorra. |

---

### Espaçamento (`spaces`)

Controla a inserção e remoção de espaços em torno de delimitadores.

| Subcampo | Tipo | Valor Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `insideParentheses` | `boolean` | `false` | Adiciona espaço interno em parênteses. `true` -> `( valor )`, `false` -> `(valor)`. |
| `insideBrackets` | `boolean` | `false` | Adiciona espaço interno em colchetes. `true` -> `[ valor ]`, `false` -> `[valor]`. |
| `insideBraces` | `boolean` | `true` | Adiciona espaço interno em chaves de linha única. `true` -> `{ valor }`, `false` -> `{valor}`. |
| `beforeParentheses` | `boolean` | `true` | Adiciona espaço antes de parênteses de controle (ex: `if (x)` vs `if(x)`). *Observação: Chamadas de função normais como `funcao()` não recebem espaço.* |

---

### Proteção de Strings e Comentários (`commentAndStringRules`)

Para evitar que o formatador quebre ou altere o conteúdo de strings e comentários do código, você pode definir como eles são delimitados.

| Subcampo | Tipo | Valor Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `lineComment` | `string` | `//` | Caractere que inicia um comentário de linha única (ex: `//` em Java/JS ou `#` em Python/Bash). |
| `blockCommentStart` | `string` | `/*` | Caractere que inicia um comentário em bloco. |
| `blockCommentEnd` | `string` | `*/` | Caractere que finaliza um comentário em bloco. |
| `stringDelimiters` | `string[]` | `["\"", "'"]` | Lista de delimitadores de strings literais (ex: `"` e `'`, ou ``` ` ``` em JS/Go). |

---

### Regras Personalizadas com Expressões Regulares (`customRules`)

Permite aplicar substituições Regex personalizadas de forma sequencial no código.

| Subcampo | Tipo | Descrição |
| :--- | :--- | :--- |
| `pattern` | `string` | A expressão regular de busca (ex: `System\\.out\\.println`). |
| `replace` | `string` | O texto de substituição (suporta capturas regex como `$1`, `$2`). |
| `description` | `string` | Uma descrição opcional da regra para documentação ou controle. |

---

## Exemplo de Configuração `.regex-formatter.json`

```json
[
  {
    "fileExtensions": ["java", "cs"],
    "indentSize": 4,
    "continuationIndentSize": 8,
    "bracesStyle": "sameLine",
    "breakBraceBlocks": true,
    "indentOnly": false,
    "forceReformat": true,
    "keepBlankLines": true,
    "lineBreakOnCharacters": [
      {
        "char": ".",
        "position": "before",
        "requireParenthesis": true,
        "beforePattern": "",
        "afterPattern": ""
      }
    ],
    "spaces": {
      "insideParentheses": false,
      "insideBrackets": false,
      "insideBraces": true,
      "beforeParentheses": true
    },
    "commentAndStringRules": {
      "lineComment": "//",
      "blockCommentStart": "/*",
      "blockCommentEnd": "*/",
      "stringDelimiters": ["\"\"\"", "\"", "'"]
    },
    "customRules": [
      {
        "pattern": "System\\.out\\.println",
        "replace": "System.out.println",
        "description": "Garante grafia correta do println"
      }
    ],
    "completeLinePatterns": [
      "^\\s*@"
    ]
  },
  {
    "fileExtensions": ["go"],
    "indentSize": 4,
    "continuationIndentSize": 4,
    "bracesStyle": "sameLine",
    "breakBraceBlocks": false,
    "indentOnly": false,
    "forceReformat": false,
    "keepBlankLines": true,
    "lineBreakOnCharacters": [
      {
        "char": ".",
        "position": "after",
        "requireParenthesis": false,
        "beforePattern": "",
        "afterPattern": ""
      }
    ],
    "spaces": {
      "insideParentheses": false,
      "insideBrackets": false,
      "insideBraces": true,
      "beforeParentheses": false
    },
    "commentAndStringRules": {
      "lineComment": "//",
      "blockCommentStart": "/*",
      "blockCommentEnd": "*/",
      "stringDelimiters": ["\"", "`"]
    },
    "completeLinePatterns": []
  }
]
```
