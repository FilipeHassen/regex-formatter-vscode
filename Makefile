.PHONY: all install setup-node compile watch test lint debug package clean

# Variável para o executável do VS Code / Antigravity (pode ser sobrescrita, ex: VSCODE_BIN=cursor)
VSCODE_BIN ?= code

# Versão mínima requerida do Node.js
NODE_MIN_VERSION := 20

# Prefixo que carrega o nvm e ativa a versão correta do Node antes de executar qualquer comando
NVM_RUN = source "$$HOME/.nvm/nvm.sh" && nvm use $(NODE_MIN_VERSION) --silent &&

# Alvo padrão: compila o projeto
all: compile

# Instala o nvm e o Node.js na versão correta (requer bash)
setup-node:
	@if ! command -v nvm > /dev/null 2>&1 && [ ! -s "$$HOME/.nvm/nvm.sh" ]; then \
		echo ">>> Instalando nvm..."; \
		curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash; \
	fi
	@echo ">>> Instalando Node.js v$(NODE_MIN_VERSION) via nvm..."
	@bash -c 'source "$$HOME/.nvm/nvm.sh" && nvm install $(NODE_MIN_VERSION) && nvm use $(NODE_MIN_VERSION) && echo ">>> Node.js $$(node -v) ativo"'

# Instala as dependências do projeto (executa setup-node antes)
install: setup-node
	@bash -c '$(NVM_RUN) npm install'

# Compila o projeto TypeScript
compile:
	@bash -c '$(NVM_RUN) npm run compile'

# Roda o compilador TypeScript em modo de observação (watch)
watch:
	@bash -c '$(NVM_RUN) npm run watch'

# Executa a suíte de testes unitários automatizados
test:
	@bash -c '$(NVM_RUN) npm test'

# Executa o linter (ESLint) para verificar a formatação do código TypeScript
lint:
	@bash -c '$(NVM_RUN) npm run lint'

# Limpa a pasta de saída (arquivos JS gerados)
clean:
	rm -rf out

# Abre o VS Code / Antigravity com a extensão ativa em cima da pasta "test-project"
debug: compile
	@bash -c '$(NVM_RUN) $(VSCODE_BIN) --extensionDevelopmentPath=$(CURDIR) $(CURDIR)/test-project'

# Empacota a extensão como .vsix
package: compile
	@bash -c '$(NVM_RUN) npx -y @vscode/vsce package'
