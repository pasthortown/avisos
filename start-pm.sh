#!/bin/bash
# ============================================
# Alertas Payroll - Inicio PM + Teammates
# ============================================
# Layout tmux:
#   ┌──────────┬──────────┐
#   │   PM     │ Dev Back │
#   │          ├──────────┤
#   │          │ Dev Front│
#   ├──────────┤──────────┤
#   │ Security │  Infra   │
#   └──────────┴──────────┘
# ============================================

SESSION_NAME="alertas-payroll"
PROJECT_DIR="/home/lsalazar/Proyectos/AlertasPayroll"

# Si ya existe la sesión, adjuntarse
if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
    echo "Sesión '$SESSION_NAME' ya existe, adjuntándose..."
    tmux attach-session -t "$SESSION_NAME"
    exit 0
fi

echo "============================================"
echo " Alertas Payroll - Equipo de Desarrollo"
echo "============================================"
echo ""
echo "Iniciando sesión tmux '$SESSION_NAME'..."
echo ""

# --- Crear sesión con el pane del PM (arriba-izquierda) ---
tmux new-session -d -s "$SESSION_NAME" -c "$PROJECT_DIR" -x 220 -y 55

# Habilitar mouse (click para cambiar de pane, scroll, resize)
tmux set -g mouse on

# --- Dividir: izquierda | derecha (50/50 vertical) ---
tmux split-window -h -t "$SESSION_NAME" -c "$PROJECT_DIR"

# Ahora: pane 0 = izquierda (PM), pane 1 = derecha

# --- Dividir izquierda: PM arriba, Security abajo ---
tmux split-window -v -t "$SESSION_NAME:0.0" -c "$PROJECT_DIR"

# Ahora: pane 0 = PM (arriba-izq), pane 1 = Security (abajo-izq), pane 2 = derecha

# --- Dividir derecha en 3 partes iguales: Dev Backend, Dev Frontend, Infra ---
# Primero dividir derecha en 2 (superior 66%, inferior 33%)
tmux split-window -v -t "$SESSION_NAME:0.2" -c "$PROJECT_DIR" -p 66

# Ahora: pane 3 = derecha-medio+abajo, pane 2 = derecha-arriba
# Dividir pane 3 en 2 (50/50)
tmux split-window -v -t "$SESSION_NAME:0.3" -c "$PROJECT_DIR" -p 50

# Layout final:
#   pane 0 = PM (arriba-izq)
#   pane 1 = Security (abajo-izq)
#   pane 2 = Dev Backend (derecha-arriba)
#   pane 3 = Dev Frontend (derecha-medio)
#   pane 4 = Infra (derecha-abajo)

# --- Nombrar los panes (para referencia visual) ---
tmux select-pane -t "$SESSION_NAME:0.0" -T "PM"
tmux select-pane -t "$SESSION_NAME:0.1" -T "Security"
tmux select-pane -t "$SESSION_NAME:0.2" -T "Dev-Backend"
tmux select-pane -t "$SESSION_NAME:0.3" -T "Dev-Frontend"
tmux select-pane -t "$SESSION_NAME:0.4" -T "Infra"

# Mostrar títulos de panes en el borde
tmux set-option -t "$SESSION_NAME" pane-border-status top
tmux set-option -t "$SESSION_NAME" pane-border-format " #{pane_title} "

# --- Lanzar Claude Code en cada pane como teammate ---

# PM (pane 0) - orquestador principal
tmux send-keys -t "$SESSION_NAME:0.0" \
  "claude --dangerously-skip-permissions" Enter

# Security (pane 1)
tmux send-keys -t "$SESSION_NAME:0.1" \
  "claude --dangerously-skip-permissions" Enter

# Dev Backend (pane 2)
tmux send-keys -t "$SESSION_NAME:0.2" \
  "claude --dangerously-skip-permissions" Enter

# Dev Frontend (pane 3)
tmux send-keys -t "$SESSION_NAME:0.3" \
  "claude --dangerously-skip-permissions" Enter

# Infra (pane 4)
tmux send-keys -t "$SESSION_NAME:0.4" \
  "claude --dangerously-skip-permissions" Enter

# --- Foco inicial en el PM ---
tmux select-pane -t "$SESSION_NAME:0.0"

# --- Adjuntar sesión ---
tmux attach-session -t "$SESSION_NAME"
