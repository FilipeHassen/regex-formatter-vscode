.PHONY: all compile watch test lint debug clean

# Variável para o executável do VS Code / Antigravity (pode ser sobrescrita, ex: VSCODE_BIN=cursor)
VSCODE_BIN ?= code

# Alvo padrão: compila o projeto
all: compile

# Compila o projeto TypeScript
compile:
	npm run compile

# Roda o compilador TypeScript em modo de observação (watch)
watch:
	npm run watch

# Executa a suíte de testes unitários automatizados
test:
	npm test

# Executa o linter (ESLint) para verificar a formatação do código TypeScript
lint:
	npm run lint

# Limpa a pasta de saída (arquivos JS gerados)
clean:
	rm -rf out

# Abre o VS Code / Antigravity com a extensão ativa em cima da pasta "test-project"
debug: compile
	$(VSCODE_BIN) --extensionDevelopmentPath=$(CURDIR) $(CURDIR)/test-project
