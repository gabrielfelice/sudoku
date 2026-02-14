# Milestone K Testing Checklist

## Pre-Testing Setup

1. Clear browser localStorage: `localStorage.clear()` in console
2. Refresh the application
3. Have browser console open to check for errors

---

## Test 1: Initialization Flow ✅

**Objective**: Verify app starts with mode selector, not auto-puzzle

### Steps

1. Clear localStorage and refresh
2. **Expected**: Mode selector modal appears
3. **Expected**: NO puzzle is loaded on the board
4. Select "Normal" mode
5. Select "Medium" difficulty
6. Click "Start Game"
7. **Expected**: Puzzle loads and game begins

### Pass Criteria

- ✅ Mode selector appears on first load
- ✅ No auto-generated puzzle
- ✅ Game starts only after user selection

---

## Test 2: Game Modes - Normal Mode 🎯

**Objective**: Verify Normal mode has timer and mistake tracking

### Steps

1. Start a Normal mode game (any difficulty)
2. **Expected**: Timer is running (updates every second)
3. **Expected**: Mistake counter shows "0"
4. Enter a wrong number
5. **Expected**: Mistake counter increments to "1"
6. Wait 10 seconds
7. **Expected**: Timer shows elapsed time

### Pass Criteria

- ✅ Timer runs continuously
- ✅ Mistakes are counted
- ✅ Both stats visible in UI

---

## Test 3: Game Modes - Zen Mode 🧘

**Objective**: Verify Zen mode has NO timer and NO mistake tracking

### Steps

1. Click "New Game" → Select "Zen" mode → Medium difficulty
2. **Expected**: Timer shows "0:00" and doesn't change
3. **Expected**: Mistake counter shows "0"
4. Enter multiple wrong numbers (3-5 errors)
5. **Expected**: Mistake counter stays at "0"
6. Wait 10 seconds
7. **Expected**: Timer still shows "0:00"

### Pass Criteria

- ✅ Timer doesn't run
- ✅ Mistakes don't count
- ✅ Relaxed gameplay experience

---

## Test 4: Game Modes - Challenge Mode ⚡

**Objective**: Verify Challenge mode shows strict limits

### Steps

1. Click "New Game" → Select "Challenge" mode → Medium difficulty
2. **Expected**: Mode selector shows "Time Limit: 20 min | Max Errors: 3 | Max Hints: 1"
3. Start the game
4. **Expected**: Timer runs
5. **Expected**: Mistakes are counted
6. Try to use hints
7. **Expected**: Limited hints available

### Pass Criteria

- ✅ Strict limits displayed
- ✅ Timer runs
- ✅ Mistakes counted
- ✅ Hint limits enforced

---

## Test 5: Settings Auto-Pause ⏸️

**Objective**: Verify game pauses when opening settings

### Steps

1. Start any game
2. Note the current timer value (e.g., "1:23")
3. Click "⚙️ Settings" button
4. **Expected**: Game pauses immediately
5. **Expected**: Timer stops
6. Wait 5 seconds with settings open
7. Close settings
8. **Expected**: Timer hasn't advanced during settings
9. **Expected**: Game resumes

### Pass Criteria

- ✅ Game auto-pauses on settings open
- ✅ Timer stops during settings
- ✅ Game resumes on close

---

## Test 6: Lock Icon Toggle 🔒

**Objective**: Verify lock icon can be toggled and defaults to OFF

### Steps

1. Start a new game
2. Open Settings → Jogabilidade tab
3. **Expected**: "Mostrar ícone de cadeado" toggle exists
4. **Expected**: Toggle is OFF by default
5. Enter a correct number
6. **Expected**: NO lock icon (🔒) appears on the cell
7. Open Settings → Enable "Mostrar ícone de cadeado"
8. Enter another correct number
9. **Expected**: Lock icon (🔒) appears on the cell
10. Disable the toggle
11. **Expected**: Lock icons disappear

### Pass Criteria

- ✅ Toggle exists in settings
- ✅ Default is OFF
- ✅ Lock icon shows/hides based on setting
- ✅ Setting persists after refresh

---

## Test 7: Victory Modal - Normal Mode 🏆

**Objective**: Verify victory modal shows time and mistakes in Normal mode

### Steps

1. Complete a puzzle in Normal mode (use hints if needed)
2. **Expected**: Victory modal appears
3. **Expected**: Shows "🎯 Normal Mode" badge
4. **Expected**: Shows time (e.g., "Time: 5:23")
5. **Expected**: Shows mistakes (e.g., "Mistakes: 2")
6. **Expected**: Shows difficulty
7. **Expected**: Shows coins earned
8. Click "Play Again"
9. **Expected**: Mode selector appears

### Pass Criteria

- ✅ Victory modal appears on completion
- ✅ Mode badge displayed
- ✅ Time and mistakes shown
- ✅ Play Again opens mode selector

---

## Test 8: Victory Modal - Zen Mode 🧘

**Objective**: Verify victory modal HIDES time and mistakes in Zen mode

### Steps

1. Complete a puzzle in Zen mode
2. **Expected**: Victory modal appears
3. **Expected**: Shows "🧘 Zen Mode" badge
4. **Expected**: Time stat is HIDDEN
5. **Expected**: Mistakes stat is HIDDEN
6. **Expected**: Shows difficulty only
7. **Expected**: Shows coins earned

### Pass Criteria

- ✅ Victory modal appears
- ✅ Zen mode badge shown
- ✅ Time and mistakes HIDDEN
- ✅ Only difficulty and coins shown

---

## Test 9: Tutorial - Auto Mode (First Load) 📚

**Objective**: Verify auto-tutorial shows checkbox and marks complete

### Steps

1. Clear localStorage
2. Refresh app
3. Skip the mode selector (or complete a game)
4. **Expected**: Tutorial appears automatically
5. **Expected**: "Não mostrar novamente" checkbox is VISIBLE
6. Check the checkbox
7. Click "Pular Tutorial"
8. Refresh the page
9. **Expected**: Tutorial doesn't appear again

### Pass Criteria

- ✅ Tutorial auto-appears on first load
- ✅ Checkbox is visible
- ✅ Checking box prevents future auto-show

---

## Test 10: Tutorial - Manual Mode (Help Button) ❓

**Objective**: Verify manual tutorial HIDES checkbox and can be reopened

### Steps

1. Complete the auto-tutorial (or mark as completed)
2. Click the "❓" button in navigation
3. **Expected**: Tutorial opens
4. **Expected**: "Não mostrar novamente" checkbox is HIDDEN
5. Complete or skip the tutorial
6. Click "❓" button again
7. **Expected**: Tutorial opens again (not blocked)

### Pass Criteria

- ✅ Tutorial opens via ❓ button
- ✅ Checkbox is HIDDEN
- ✅ Can be reopened multiple times

---

## Test 11: Keyboard in Training ⌨️

**Objective**: Verify keyboard works during lessons

### Steps

1. Navigate to Training → Select any lesson
2. Start the lesson
3. Click on an empty cell
4. Press number keys (1-9) on keyboard
5. **Expected**: Numbers input correctly
6. Press 'n' key
7. **Expected**: Note mode toggles
8. Press number keys in note mode
9. **Expected**: Notes are added
10. Press 'u' key
11. **Expected**: Undo works

### Pass Criteria

- ✅ Keyboard input works in lessons
- ✅ Mode switching works (n key)
- ✅ Undo works (u key)
- ✅ No conflicts with lesson logic

---

## Test 12: Saved Game Continuation 💾

**Objective**: Verify saved games still work correctly

### Steps

1. Start a game and make some moves
2. Refresh the page
3. **Expected**: "Continue Game" modal appears
4. Click "Continue"
5. **Expected**: Game resumes with previous state
6. **Expected**: Timer continues from saved time
7. **Expected**: Mistakes preserved

### Pass Criteria

- ✅ Saved game detected
- ✅ State restored correctly
- ✅ Timer and mistakes preserved

---

## Test 13: Mode Switching 🔄

**Objective**: Verify switching between modes works

### Steps

1. Start a Normal mode game
2. Click "New Game" → Select Zen mode
3. **Expected**: New Zen game starts
4. **Expected**: Timer doesn't run
5. Click "New Game" → Select Challenge mode
6. **Expected**: New Challenge game starts
7. **Expected**: Timer runs

### Pass Criteria

- ✅ Can switch between modes
- ✅ Each mode has correct behavior
- ✅ No state leakage between modes

---

## Summary

### Critical Tests (Must Pass)

- ✅ Test 1: Initialization Flow
- ✅ Test 2: Normal Mode
- ✅ Test 3: Zen Mode
- ✅ Test 5: Settings Auto-Pause
- ✅ Test 6: Lock Icon Toggle
- ✅ Test 10: Tutorial Manual Mode

### Important Tests (Should Pass)

- ✅ Test 4: Challenge Mode
- ✅ Test 7: Victory Normal
- ✅ Test 8: Victory Zen
- ✅ Test 11: Keyboard in Training

### Nice to Have Tests

- ✅ Test 9: Tutorial Auto Mode
- ✅ Test 12: Saved Game
- ✅ Test 13: Mode Switching

---

## Known Issues / Limitations

1. **Lesson Demonstrations**: Not implemented (requires content creation)
2. **Statistics Isolation**: May need verification that mode-specific stats are properly separated
3. **Challenge Mode Limits**: UI shows limits but enforcement may need testing

---

## Reporting Issues

If any test fails, report with:

1. Test number and name
2. Steps to reproduce
3. Expected vs actual behavior
4. Browser console errors (if any)
5. Screenshots/recordings if applicable
