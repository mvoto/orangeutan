# Orangeutan

A calm logic puzzle. The player fills grids with monkeys and oranges and earns a picture for each one they solve.

## Language

**Puzzle**:
The grid to fill, including its givens and edge clues, plus the picture earned by solving it.
_Avoid_: board, challenge

**Level**:
One step in a finite sequence, ordered from easier to harder. Each Level has one Puzzle. Solving that Puzzle opens the next Level and retires this one. The player only sees the current unsolved Level, until the last Level.
_Avoid_: stage, world, replay. Do not use Level to mean the grid itself.

**Symbol**:
A monkey or an orange. The two marks a cell can hold.
_Avoid_: tile, piece, icon

**Given**:
A cell that already holds a Symbol when the Puzzle starts. The player cannot change it.
_Avoid_: clue, hint

**Edge clue**:
A mark on the border between two adjacent cells. `=` means those cells hold the same Symbol. `×` means they hold opposite Symbols.
_Avoid_: hint, note

**Celebration**:
The screen after a Puzzle is solved. The orangutan and the orange are celebrating. The player opens the next Level from here, or returns Home after the last Level. There is no way back to the Puzzle. It is not the Puzzle's picture.
_Avoid_: victory, win screen, picture

**Score**:
How many Levels the player has solved. It is shown only when every Level is solved.
_Avoid_: points, stars, time

**Play time**:
Whole seconds the player has a Level open while the app is in the foreground. Each Level has its own timer, shown as `timer: 00:01`. Home shows the sum of those timers, including the Level in progress, as `total timer: 00:30`.
_Avoid_: score, points, rank, stars

**Nickname**:
The public name on a Rank. The game assigns it, and the player may change it.
_Avoid_: username, profile, avatar

**Rank**:
A player's place for one Level, ordered by that Level's Play time.
_Avoid_: score, leaderboard, total
