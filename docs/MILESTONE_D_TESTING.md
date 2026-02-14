# Milestone D - Testing Instructions

## Quick Start

1. **Ensure dev server is running**: `npm run dev`
2. **Open browser**: Navigate to `http://localhost:3000`
3. **Open Settings**: Click "⚙️ Configurações" button (below difficulty selector)

## Test Scenarios

### Scenario 1: Note Synchronization (5 min)

**Setup:**

1. Start a new Medium game
2. Open Settings → Jogabilidade
3. Enable all three note-related settings:
   - ✅ Auto-travar ao acertar
   - ✅ Auto-remover notas
   - ✅ Auto-limpar notas inválidas

**Test Steps:**

1. Switch to Note mode (pencil icon)
2. Select an empty cell
3. Add notes 1, 2, 3 by pressing those keys
4. Select another empty cell in the same row
5. Add notes 2, 3, 4
6. Switch back to Answer mode
7. Place the correct answer (check solution if needed)
8. **Verify**: The digit is removed from notes in all peer cells
9. **Verify**: Cell is locked (shows 🔒 icon)

**Expected Result:** ✅ Notes automatically cleaned, cell locked

---

### Scenario 2: Solver Techniques (5 min)

**Setup:**

1. Start a new Hard game
2. Play a few moves to create some complexity

**Test Steps:**

1. Click "Dica" button
2. Read the explanation (should be in Portuguese)
3. **Verify**: Technique name shown (e.g., "Naked Single", "Hidden Single")
4. Click "Aplicar Dica"
5. **Verify**: Number placed correctly
6. Repeat 5-10 times
7. **Look for**: Different techniques appearing:
   - Naked Single
   - Hidden Single (row/col/block)
   - Naked Pair
   - Pointing Pair
   - Box-Line Reduction

**Expected Result:** ✅ Multiple technique types with Portuguese explanations

---

### Scenario 3: Theme Customization (3 min)

**Setup:**

1. Open Settings → Tema

**Test Steps:**

1. Click "Alto Contraste" button
2. **Verify**: Board changes to yellow/black theme
3. Click "Daltônico" button
4. **Verify**: Board changes to blue/orange theme
5. Scroll to "Personalização Manual"
6. Change "Célula selecionada" to bright red (#ff0000)
7. Close settings
8. Click any cell
9. **Verify**: Selected cell has red background
10. Refresh the page (F5)
11. **Verify**: Red background persists after refresh

**Expected Result:** ✅ Theme changes apply immediately and persist

---

### Scenario 4: Player Configuration (5 min)

**Setup:**

1. Open Settings → Jogabilidade

**Test Steps:**

1. Disable "Mostrar destaque de peers"
2. Close settings
3. Click a cell
4. **Verify**: Row/column/block NOT highlighted
5. Open settings again
6. Disable "Mostrar destaque de mesmo número"
7. Place a number (e.g., 5)
8. Click another cell with 5
9. **Verify**: Other 5s NOT outlined
10. Open settings
11. Disable "Auto-travar ao acertar"
12. Place a correct answer
13. **Verify**: No 🔒 icon appears
14. **Verify**: Can still edit the cell
15. Open settings
16. Set "Limite de erros" to 3
17. Close settings

**Expected Result:** ✅ All toggles work as expected

---

### Scenario 5: Persistence Verification (2 min)

**Setup:**

1. Complete Scenario 3 and 4 first

**Test Steps:**

1. Open browser DevTools (F12)
2. Go to Application → Local Storage → http://localhost:3000
3. **Verify**: See these keys:
   - `sudoku-player-config`
   - `sudoku-theme-config`
   - `sudoku-saved-game` (if you've played)
4. Click on `sudoku-player-config`
5. **Verify**: JSON shows your settings (e.g., `"autoLockOnCorrect": false`)
6. Click on `sudoku-theme-config`
7. **Verify**: JSON shows your theme (e.g., `"selectedCellBg": "#ff0000"`)
8. Close the browser tab completely
9. Open a new tab to http://localhost:3000
10. **Verify**: Settings and theme are still applied

**Expected Result:** ✅ All preferences persist across sessions

---

### Scenario 6: Undo with Hints (2 min)

**Setup:**

1. Start a new game

**Test Steps:**

1. Click "Dica" button
2. Click "Aplicar Dica"
3. **Verify**: Number placed
4. Click "Desfazer" (undo) button
5. **Verify**: Number removed
6. **Verify**: Cell returns to previous state
7. Add some notes to a cell
8. Click "Dica" then "Aplicar Dica"
9. Click "Desfazer"
10. **Verify**: Notes restored

**Expected Result:** ✅ Undo works with hint applications

---

## Edge Cases to Test

### Edge Case 1: Multiple Config Changes

1. Rapidly toggle multiple settings on/off
2. **Verify**: No errors in console
3. **Verify**: All changes saved to localStorage

### Edge Case 2: Theme Reset

1. Customize all 9 theme colors manually
2. Click "Padrão" preset
3. **Verify**: All colors reset to default blue theme

### Edge Case 3: Auto-Clean with Complex Board

1. Fill board with many numbers
2. Add notes to remaining cells
3. Enable "Auto-limpar notas inválidas"
4. Place a correct answer
5. **Verify**: Invalid notes removed from all cells
6. **Verify**: No console errors

---

## Performance Checks

1. **Theme Changes**: Should apply instantly (< 100ms)
2. **Settings Save**: Should not cause lag
3. **Note Sync**: Should complete in < 50ms even on full board
4. **Hint Calculation**: Should return in < 500ms for most puzzles

---

## Browser Compatibility

Test in:

- ✅ Chrome/Edge (primary)
- ✅ Firefox
- ✅ Safari (if available)

---

## Success Criteria

All scenarios pass with:

- ✅ No console errors
- ✅ Expected visual changes
- ✅ Persistence working
- ✅ Smooth performance

---

## Troubleshooting

**Issue**: Settings don't persist
**Fix**: Check localStorage is enabled in browser

**Issue**: Theme doesn't apply
**Fix**: Check browser console for CSS variable errors

**Issue**: Hints not showing new techniques
**Fix**: Try a harder difficulty puzzle

**Issue**: Notes not syncing
**Fix**: Verify settings are enabled in Jogabilidade tab

---

## Reporting Issues

If you find bugs, note:

1. Which scenario failed
2. Browser and version
3. Console errors (F12 → Console)
4. Steps to reproduce
