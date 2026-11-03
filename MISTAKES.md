# Mistakes to avoid

- **zsh does not word-split unquoted variables.** `set -- $spec` or `for x in $list` behaves differently in the
  Bash tool's zsh shell, which made curl loops fail silently twice in this project. Wrap such snippets in `bash -c '...'`
  or use zsh arrays (`${=var}`).
