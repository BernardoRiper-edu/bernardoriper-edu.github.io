# bernardoriper-edu.github.io

Site de professor (Jekyll + GitHub Pages).

## Onde editar

| O quê | Arquivo |
|---|---|
| E-mail, WhatsApp, Instagram, LinkedIn, link do Calendly | `_config.yml` |
| Textos das páginas IB, IGCSE, SAT, ENEM (sobre, "como posso ajudar", disciplinas, formato) | `_data/programas.yml` |
| **Escola atual** (nome, sigla, paleta de 5 cores, anos, plantão, links úteis) | `_data/escola.yml` |
| **Materiais por ano** (PDFs dos alunos) | `assets/materiais/<ano>/<tipo>/` — ex.: `assets/materiais/Y9/lista/Lista 03.pdf` |
| Como funciona / formatos / investimento / FAQ | `aulas.html` |
| Ferramentas de ensino (página da escola) | `_data/ferramentas.yml` + HTML em `escola/ferramentas/<ferramenta>/` + imagem de capa em `assets/ferramentas/` |
| Jogos interativos (página da escola) | `_data/jogos.yml` + HTML em `escola/jogos/<jogo>/` + GIF em `assets/jogos/` |

## Páginas

- `/` — Calendly no topo, mosaico de artigos (com filtro por programa), atalhos para os programas
- `/ib/`, `/igcse/`, `/sat/`, `/enem/` — página de cada programa + artigos daquele programa
- `/escola/` — apoio ao trabalho na escola atual (hoje TBS): avisos, materiais por turma, plantão
- `/aulas/` — aulas particulares: como funciona, formatos, FAQ
- `/contato/`

## Novo artigo

Crie `_articles/nome-do-artigo.md`:

```yaml
---
title: "Título"
date: 2026-11-17
summary: "Resumo que aparece no card."
image: /assets/img/arquivo.jpg   # opcional
size: card-normal                # card-normal | card-wide | card-tall | card-big
programas: [ib, sat]             # ib | igcse | sat | enem | escola  → define onde o artigo aparece
---
Texto em Markdown.
```

Artigos com `programas: [escola]` aparecem como **Avisos** na página da escola e não mostram o botão de agendar aula.

Materiais (PDFs) podem ir em `assets/materiais/` e ser linkados em `_data/escola.yml` como `/assets/materiais/arquivo.pdf`.

## Visual

Tema "caderno": papel quadriculado, tinta azul e uma cor de marca-texto por programa.
As cores ficam no topo de `assets/css/style.css` (`--hl-ib`, `--hl-igcse`, `--hl-sat`, `--hl-enem`). A cor da escola vem de `_data/escola.yml`.
A cor do card de um artigo vem do primeiro item de `programas`.
Fontes (hospedadas no próprio site, em `assets/fonts/`): Bricolage Grotesque nos títulos e Atkinson Hyperlegible no texto.

## Trocar de escola

Edite só `_data/escola.yml`: `nome`, `sigla`, as 5 `cores` (principal, destaque, texto, fundo, linhas) e o conteúdo.
O menu, os filtros, as etiquetas e a página `/escola/` se ajustam sozinhos; o endereço `/escola/` não muda.
Com `aplicar_no_site_todo: true` a paleta da escola vale para o site inteiro; com `false`, só para a página da escola e os avisos dela.

## Materiais por ano (página da escola)

Cada ano (Y7 a Y13) tem três pastas em `assets/materiais/<ano>/`: `material`, `lista` e `gabarito`.
Para publicar um arquivo, suba o PDF na pasta certa — o site lista sozinho e abre o PDF numa janela com visualizador.
O nome do arquivo é o que os alunos veem; a lista é ordenada pelo nome (Lista 2 vem antes de Lista 10).
Os anos e os tipos ficam em `_data/escola.yml` (bloco `materiais`).

Depois dos anos vem o quadrado **Todos**: livros em `assets/materiais/Todos/livros/` (abrem no mesmo visualizador) e o link do canal do YouTube, que se cola em `_data/escola.yml` (`materiais.todos.youtube`). O visualizador usa o PDF.js (em `assets/vendor/pdfjs/`).
