# Milestone N: Advanced Rules - Testing Guide

This document provides comprehensive manual test cases for Milestone N features.

## Prerequisites

1. Run `npm run dev` and open http://localhost:3000
2. Ensure you have a clean state (or clear localStorage if needed)

---

## Test Suite 1: Optional 1-Error Limit

### Test 1.1: Configure 1-Error Limit

**Steps:**
1. Click ⚙️ Settings button
2. Go to "Jogabilidade" tab
3. Locate "Limite de erros" dropdown
4. Verify options: Ilimitado, 1, 3, 5
5. Select "1"
6. Click "Salvar"

**Expected:**
- ✅ Dropdown shows all four options
- ✅ "1" option is selectable
- ✅ Settings save successfully
- ✅ Toast: "Personalização salva com sucesso!"

### Test 1.2: Error Limit Modal Appears

**Steps:**
1. Set error limit to 1 (Test 1.1)
2. Start a new game
3. Intentionally enter a wrong answer

**Expected:**
- ✅ Error count shows "1/1"
- ✅ Game pauses automatically
- ✅ ErrorLimitModal appears with:
  - ⚠️ icon
  - "Error Limit Reached" title
  - "1/1 errors" display
  - Three buttons: Continue, Restart, New Game

---

## Test Suite 2: Error Limit Behaviors

### Test 2.1: Continue Behavior

**Steps:**
1. Trigger error limit modal (Test 1.2)
2. Click "Continue Playing" button

**Expected:**
- ✅ Modal closes
- ✅ Game unpauses
- ✅ Can continue playing
4. Enter another wrong answer

**Expected:**
- ✅ Error count increases to 2
- ✅ No modal appears (limit bypassed)
- ✅ Can keep playing indefinitely

### Test 2.2: Restart Behavior

**Steps:**
1. Play a game, make some progress (fill 5-10 cells)
2. Note the current puzzle state
3. Trigger error limit modal
4. Click "Restart Puzzle" button

**Expected:**
- ✅ Modal closes
- ✅ Same puzzle reloads (same givens)
- ✅ All user-entered cells are cleared
- ✅ Timer resets to 00:00
- ✅ Error count resets to 0
- ✅ Toast: "Puzzle restarted!"

### Test 2.3: New Game Behavior

**Steps:**
1. Play a game, note the puzzle pattern
2. Trigger error limit modal
3. Click "New Game" button

**Expected:**
- ✅ Modal closes
- ✅ Completely new puzzle is generated (different pattern)
- ✅ Timer resets to 00:00
- ✅ Error count resets to 0
- ✅ Same difficulty is maintained

---

## Test Suite 3: Expert Hint Limit

### Test 3.1: Configure Expert Hint Limit

**Steps:**
1. Open Settings → Jogabilidade
2. Locate "Limite de dicas (Expert)" dropdown
3. Verify options: 1, 2, 3
4. Select "1"
5. Save settings

**Expected:**
- ✅ Dropdown shows options 1, 2, 3
- ✅ "1" is selectable
- ✅ Settings save successfully

### Test 3.2: Expert Hint Limit Enforcement

**Steps:**
1. Set expert hint limit to 1 (Test 3.1)
2. Start new Expert difficulty game
3. Open Help Panel (right sidebar)
4. Verify hint counter shows "Hints Used: 0 / 1"
5. Request a hint (via ActionBar or Help Panel)

**Expected:**
- ✅ Hint works normally
- ✅ Counter updates to "1 / 1"
- ✅ Progress bar fills to 100%

6. Request another hint

**Expected:**
- ✅ Toast appears: "Hint limit reached (1/1)"
- ✅ No hint is shown
- ✅ Counter remains at "1 / 1"

### Test 3.3: Hint Limit UI Visibility

**Steps:**
1. Start Easy difficulty game
2. Check Help Panel

**Expected:**
- ✅ No hint counter visible (only Expert has limits)

3. Start Expert difficulty game
4. Check Help Panel

**Expected:**
- ✅ Hint counter visible
- ✅ Shows "Hints Used: 0 / 3" (or configured limit)
- ✅ Progress bar visible

---

## Test Suite 4: Candidate Filtering with Timeout

### Test 4.1: Candidate Filter UI

**Prerequisites:**
- Purchase "Candidate Filter" item from shop (or modify inventory in code)

**Steps:**
1. Start a game
2. Open Help Panel
3. Locate "🔍 Candidate Filter" button

**Expected:**
- ✅ Button is visible and enabled
- ✅ Button shows "🔍 Candidate Filter"

4. Click the button

**Expected:**
- ✅ Digit selector appears (grid of 1-9)
- ✅ All digits are clickable

### Test 4.2: Candidate Filter Execution

**Steps:**
1. Open candidate filter digit selector (Test 4.1)
2. Click digit "5"

**Expected:**
- ✅ Button shows loading state: "⏳ Filtering..."
- ✅ Button is disabled
- ✅ Digit selector closes
- ✅ After ~100ms, filtering completes
- ✅ Button returns to normal: "🔍 Candidate Filter"
- ✅ Button is re-enabled

### Test 4.3: Timeout Behavior (Simulated)

**Note:** Current implementation simulates filtering in 100ms. To test timeout, modify `HelpPanel.tsx` line 48 to use a longer delay:

```typescript
setTimeout(() => {
  dispatch({ type: "APPLY_CANDIDATE_FILTER", digit });
  resolve(true);
}, 11000); // 11 seconds - exceeds 10s timeout
```

**Steps:**
1. Modify code as above
2. Reload page
3. Open candidate filter
4. Click any digit

**Expected:**
- ✅ Button shows "⏳ Filtering..." for 10 seconds
- ✅ After 10 seconds, filtering stops
- ✅ Toast appears: "Candidate filtering timed out (10s limit)"
- ✅ Button returns to normal state

---

## Test Suite 5: Temporal Feedback

### Test 5.1: Temporal Feedback on Correct Answer

**Steps:**
1. Start a game
2. Select an empty cell
3. Enter a correct digit

**Expected:**
- ✅ Cell shows blue glow animation (expanding ring)
- ✅ Animation lasts ~400ms
- ✅ Animation is subtle and non-intrusive

### Test 5.2: Temporal Feedback on Wrong Answer

**Steps:**
1. Select an empty cell
2. Enter a wrong digit

**Expected:**
- ✅ Cell shows blue glow animation
- ✅ Cell turns red (wrong status)
- ✅ Both effects are visible

### Test 5.3: Temporal Feedback on Undo

**Steps:**
1. Enter a digit in a cell
2. Click "Desfazer" button

**Expected:**
- ✅ Cell shows temporal feedback animation
- ✅ Cell value reverts to previous state

### Test 5.4: Temporal Feedback on Clear

**Steps:**
1. Select a cell with a value
2. Press Backspace or click "Limpar"

**Expected:**
- ✅ Cell shows temporal feedback animation
- ✅ Cell value is cleared

---

## Test Suite 6: Exploit Prevention

### Test 6.1: Error Limit Behavior Persistence

**Steps:**
1. Set error limit to 1
2. Start a game
3. Make 1 error → modal appears
4. Click "Continue"
5. Open Settings
6. Change error limit to 3
7. Save settings
8. Make another error

**Expected:**
- ✅ No modal appears (behavior persists)
- ✅ Error count increases to 2
- ✅ Can continue playing

### Test 6.2: Behavior Reset on New Puzzle

**Steps:**
1. Set error limit to 1
2. Start a game
3. Make 1 error → modal appears
4. Click "Continue"
5. Start a new game (via "New Game" button)
6. Make 1 error

**Expected:**
- ✅ Modal appears again (behavior reset for new puzzle)
- ✅ Error count shows "1/1"

---

## Test Suite 7: Edge Cases

### Test 7.1: Zen Mode with Error Limit

**Steps:**
1. Set error limit to 1
2. Start Zen mode game
3. Make multiple errors

**Expected:**
- ✅ Errors don't count in Zen mode
- ✅ No modal appears
- ✅ Can make unlimited errors

### Test 7.2: Multiple Rapid Actions

**Steps:**
1. Select a cell
2. Rapidly enter digits: 1, 2, 3, 4, 5 (quickly)

**Expected:**
- ✅ Each action triggers temporal feedback
- ✅ Animations don't stack or glitch
- ✅ Last action's animation is visible

### Test 7.3: Candidate Filter During Game Pause

**Steps:**
1. Pause the game
2. Try to use candidate filter

**Expected:**
- ✅ Candidate filter button is accessible
- ✅ Can use filter while paused (help items work when paused)

---

## Test Suite 8: Integration Tests

### Test 8.1: Error Limit + Temporal Feedback

**Steps:**
1. Set error limit to 1
2. Start a game
3. Make 1 wrong answer

**Expected:**
- ✅ Temporal feedback animation plays
- ✅ Cell turns red
- ✅ Error limit modal appears
- ✅ All effects work together smoothly

### Test 8.2: Restart + Temporal Feedback

**Steps:**
1. Make progress on a puzzle
2. Trigger error limit modal
3. Click "Restart"

**Expected:**
- ✅ Puzzle resets
- ✅ No temporal feedback on reset (no selected cell)
- ✅ Can play normally after restart

---

## Regression Tests

### Test 9.1: Existing Features Still Work

**Steps:**
1. Test basic gameplay (enter digits, notes, inspect mode)
2. Test undo/redo
3. Test hints
4. Test error explanations
5. Test pause/resume
6. Test settings changes
7. Test victory condition

**Expected:**
- ✅ All existing features work as before
- ✅ No regressions introduced

---

## Performance Tests

### Test 10.1: Temporal Feedback Performance

**Steps:**
1. Make 50 consecutive actions (enter digits rapidly)

**Expected:**
- ✅ No lag or stuttering
- ✅ Animations remain smooth
- ✅ No memory leaks

### Test 10.2: Candidate Filter Timeout Performance

**Steps:**
1. Trigger candidate filter timeout (Test 4.3)
2. Verify UI remains responsive

**Expected:**
- ✅ UI doesn't freeze during 10-second wait
- ✅ Can interact with other elements
- ✅ Timeout triggers correctly

---

## Summary Checklist

- [ ] 1-error limit configurable in settings
- [ ] Error limit modal appears when limit reached
- [ ] Continue behavior works and persists
- [ ] Restart behavior resets puzzle correctly
- [ ] New game behavior generates new puzzle
- [ ] Expert hint limit UI visible and functional
- [ ] Expert hint limit enforced correctly
- [ ] Candidate filter has loading state
- [ ] Candidate filter timeout works (10s)
- [ ] Temporal feedback on correct answers
- [ ] Temporal feedback on wrong answers
- [ ] Temporal feedback on undo
- [ ] Temporal feedback on clear
- [ ] Error limit behavior persists across setting changes
- [ ] Behavior resets on new puzzle
- [ ] Zen mode ignores error limits
- [ ] No regressions in existing features
- [ ] Performance is acceptable

---

## Notes

- All tests should be performed on a clean state
- Some tests require code modifications (timeout simulation)
- Temporal feedback is subtle - look for blue glow expanding from cell
- Error limit modal should only appear once per puzzle (until behavior is set)
