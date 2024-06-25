const tic_tac_toe = {
    // Game properties and methods
    board: ['','','','','','','','',''],
    symbols: {
        options: ['O', 'X'],
        turn_index: 0,
        change() {
            this.turn_index = (this.turn_index === 0 ? 1 : 0);
        }
    },
    game_mode: 'two_players', // Default game mode
    container_element: null,
    gameover: false,
    winning_sequences: [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ],
    status_element: null,

    init(container) {
        this.container_element = container;
        this.status_element = document.getElementById('status');
        this.start(); // Start the game immediately
    },

    set_game_mode(mode) {
        this.game_mode = mode;
        this.restart(); // Restart the game with the new mode
    },

    start() {
        this.board.fill('');
        this.draw();
        this.gameover = false;
        this.update_status();
    },

    make_play(position) {
        if (this.gameover || this.board[position] !== '') return false;

        const currentSymbol = this.symbols.options[this.symbols.turn_index];
        this.board[position] = currentSymbol;
        this.draw();

        const winning_sequences_index = this.check_winning_sequences(currentSymbol);
        if (this.is_game_over() || winning_sequences_index >= 0) {
            this.game_is_over(winning_sequences_index);
        } else {
            this.symbols.change();

            if (this.game_mode === 'computer' && this.symbols.turn_index === 1) {
                setTimeout(() => {
                    this.make_computer_move();
                }, 500); // Delay for visual effect
            }
        }

        this.update_status();
        return true;
    },

    make_computer_move() {
        const bestMove = this.minimax(this.board, this.symbols.options[1]).index;
        if (bestMove !== undefined) {
            this.make_play(bestMove);
        }
    },

    minimax(board, player) {
        const opponent = (player === this.symbols.options[1]) ? this.symbols.options[0] : this.symbols.options[1];

        const emptyIndices = board.reduce((acc, val, idx) => {
            if (val === '') acc.push(idx);
            return acc;
        }, []);

        if (this.check_winner(board, this.symbols.options[0])) {
            return { score: -10 };
        } else if (this.check_winner(board, this.symbols.options[1])) {
            return { score: 10 };
        } else if (emptyIndices.length === 0) {
            return { score: 0 };
        }

        const moves = [];
        for (let i = 0; i < emptyIndices.length; i++) {
            const move = {};
            move.index = emptyIndices[i];
            board[emptyIndices[i]] = player;

            const result = this.minimax(board, opponent);
            move.score = result.score;

            board[emptyIndices[i]] = '';
            moves.push(move);
        }

        let bestMove;
        if (player === this.symbols.options[1]) {
            let bestScore = -Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = moves[i];
                }
            }
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = moves[i];
                }
            }
        }

        return bestMove;
    },

    check_winning_sequences(symbol) {
        for (let i in this.winning_sequences) {
            if (this.board[this.winning_sequences[i][0]] === symbol &&
                this.board[this.winning_sequences[i][1]] === symbol &&
                this.board[this.winning_sequences[i][2]] === symbol) {
                return i;
            }
        }
        return -1;
    },

    check_winner(board, player) {
        for (let sequence of this.winning_sequences) {
            if (board[sequence[0]] === player && board[sequence[1]] === player && board[sequence[2]] === player) {
                return true;
            }
        }
        return false;
    },

    game_is_over(winning_sequences_index) {
        this.gameover = true;
        if (winning_sequences_index >= 0) {
            this.stylize_winner_sequence(this.winning_sequences[winning_sequences_index]);
            this.status_element.textContent = `Player ${this.symbols.turn_index === 0 ? 1 : 2} wins!`;
        } else {
            this.status_element.textContent = "It's a draw!";
        }
    },

    is_game_over() {
        return !this.board.includes('');
    },

    restart() {
        this.board.fill('');
        this.draw();
        this.gameover = false;
        this.symbols.turn_index = 0;
        this.update_status();

        if (this.game_mode === 'computer' && this.symbols.turn_index === 1) {
            setTimeout(() => {
                this.make_computer_move();
            }, 500); // Delay for visual effect
        }
    },

    stylize_winner_sequence(winner_sequence) {
        winner_sequence.forEach((position) => {
            this.container_element.querySelector(`div:nth-child(${position + 1})`).classList.add('winner');
        });
    },

    draw() {
        this.container_element.innerHTML = this.board.map((element, index) =>
            `<div onclick="tic_tac_toe.make_play(${index})">${element}</div>`
        ).join('');
    },

    update_status() {
        if (!this.gameover) {
            this.status_element.textContent = `Player ${this.symbols.turn_index + 1}, make your move!`;
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('board');
    tic_tac_toe.init(container);
});
