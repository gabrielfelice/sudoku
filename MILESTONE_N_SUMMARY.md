# Milestone N: Advanced Rules - Summary

## Overview

Milestone N implements advanced game rules to refine the Sudoku experience with optional strict error limits, flexible limit-reached behaviors, temporal feedback for user actions, and candidate filtering with timeout protection.

## Implemented Features

### 1. Optional 1-Error Limit

**Configuration:**
- Added `1` as an option to the error limit dropdown in Settings
- Available options: Unlimited, 1, 3, 5
- Configurable via Settings → Jogabilidade → "Limite de erros"

**Behavior:**
- When error limit is reached, the game pauses automatically
- ErrorLimitModal appears with three options (see below)
- Error limit is enforced in real-time during gameplay

### 2. Error Limit Behaviors

When the error limit is reached, users are presented with three choices:

#### Continue
- Keeps playing without restrictions
- Errors still count but don't block gameplay
- Useful for learning or casual play

#### Restart
- Resets the current puzzle to initial state
- Same puzzle, fresh start
- Timer resets to 00:00
- Error count resets to 0
- All progress is cleared

#### New Game
- Generates a completely new puzzle
- Same difficulty and play mode
- Timer resets to 00:00
- Error count resets to 0

**Implementation Details:**
- `errorLimitBehavior` field in `PlayerConfig` tracks chosen behavior
- Behavior persists until puzzle is completed or manually changed
- Prevents exploits: changing error limit in settings doesn't reset behavior

### 3. Expert Hint Limit (Validated)

**Existing Feature - Validated:**
- Expert difficulty puzzles have a configurable hint limit (1-3 hints)
- Default: 3 hints
- Configurable via Settings → Jogabilidade → "Limite de dicas (Expert)"
- UI shows hint usage counter when playing Expert puzzles
- Progress bar visualizes hint consumption

**UI Location:**
- Settings modal, "Jogabilidade" tab, lines 485-506
- HelpPanel shows hint counter for Expert difficulty (lines 53-67)

### 4. Candidate Filtering with Timeout

**Feature:**
- Help item that filters candidate numbers
- 10-second timeout to prevent UI freezing on complex puzzles
- Visual loading state while filtering

**Implementation:**
- `candidateFilterTimeout` in `PlayerConfig` (default: 10000ms)
- `candidateFilterInProgress` state tracks filtering status
- Promise.race() pattern for timeout enforcement
- Toast notification on timeout: "Candidate filtering timed out (10s limit)"

**UI:**
- Button shows loading spinner (⏳) while filtering
- Button and digit selector disabled during filtering
- Automatic completion or timeout handling

### 5. Temporal Feedback

**Feature:**
- Subtle visual feedback when user performs actions
- Helps confirm actions were registered
- Non-intrusive animation (< 500ms)

**Triggers:**
- Entering a digit (correct or wrong)
- Clearing a cell
- Applying a hint
- Undoing an action

**Implementation:**
- `lastActionTimestamp` in `GameState` tracks last action time
- CSS animation: `temporalFeedback` (blue glow expanding from cell)
- Applied to selected cell when action is recent (< 500ms)

## Technical Implementation

### State Changes

**PlayerConfig:**
```typescript
{
  maxErrors: number | null; // Now includes 1 as option
  errorLimitBehavior: "continue" | "restart" | "new-game" | null;
  candidateFilterTimeout: number; // Default: 10000ms
}
```

**GameState:**
```typescript
{
  lastActionTimestamp: number; // For temporal feedback
  candidateFilterInProgress: boolean; // Track filtering state
}
```

### New Actions

```typescript
| { type: "SET_ERROR_LIMIT_BEHAVIOR"; behavior: "continue" | "restart" | "new-game" }
| { type: "RESTART_PUZZLE" }
| { type: "START_CANDIDATE_FILTER" }
| { type: "COMPLETE_CANDIDATE_FILTER" }
```

### New Components

**ErrorLimitModal.tsx:**
- Displays when error limit is reached
- Three prominent action buttons
- Visual error count display
- Responsive design

### Modified Components

**SettingsModal.tsx:**
- Added `1` to error limit dropdown

**HelpPanel.tsx:**
- Enhanced candidate filter with timeout logic
- Loading state and disabled state during filtering
- Toast notification on timeout

**SudokuCell.tsx:**
- Added temporal feedback animation class
- Checks `lastActionTimestamp` to apply animation

**page.tsx:**
- Integrated ErrorLimitModal
- Auto-generates new game when "new-game" behavior is selected

**reducer.ts:**
- Error limit enforcement on wrong answers
- Pauses game when limit reached (if no behavior set)
- Temporal feedback tracking on actions
- New action handlers for all Milestone N features

**globals.css:**
- Added `temporalFeedback` keyframe animation
- Blue glow effect expanding from cell

## Configuration

### Default Values

```typescript
{
  maxErrors: null, // Unlimited
  errorLimitBehavior: null, // No behavior until limit reached
  candidateFilterTimeout: 10000, // 10 seconds
}
```

### User Configuration

1. **Error Limit:**
   - Settings → Jogabilidade → "Limite de erros"
   - Options: Ilimitado, 1, 3, 5

2. **Expert Hint Limit:**
   - Settings → Jogabilidade → "Limite de dicas (Expert)"
   - Options: 1, 2, 3

3. **Candidate Filter Timeout:**
   - Not user-configurable (hardcoded to 10s)
   - Can be modified in code via `candidateFilterTimeout`

## UX Improvements

1. **Clear Feedback:**
   - Modal clearly explains what happened
   - Three distinct options with descriptions
   - Visual error count display

2. **Non-Punitive:**
   - "Continue" option allows learning from mistakes
   - "Restart" gives second chance on same puzzle
   - "New Game" provides fresh start

3. **Temporal Feedback:**
   - Confirms actions were registered
   - Subtle and non-intrusive
   - Helps users feel in control

4. **Timeout Protection:**
   - Prevents UI freezing on complex operations
   - Clear notification when timeout occurs
   - Loading state shows operation in progress

## Exploit Prevention

1. **Behavior Persistence:**
   - Once error limit behavior is set, it persists
   - Changing error limit in settings doesn't reset behavior
   - Prevents users from bypassing limit by changing settings

2. **Timeout Enforcement:**
   - Hard 10-second limit on candidate filtering
   - Cannot be bypassed by user
   - Protects against infinite loops or performance issues

## Files Modified

### Created:
- `src/components/ErrorLimitModal.tsx`

### Modified:
- `src/state/types.ts` - Added new state fields
- `src/state/reducer.ts` - Added error limit logic and new actions
- `src/components/SettingsModal.tsx` - Added 1-error option
- `src/components/HelpPanel.tsx` - Added timeout logic
- `src/components/SudokuCell.tsx` - Added temporal feedback
- `src/app/page.tsx` - Integrated ErrorLimitModal
- `src/app/globals.css` - Added temporal feedback animation

## Testing Recommendations

See [MILESTONE_N_TESTING.md](./MILESTONE_N_TESTING.md) for detailed test cases.

## Future Enhancements

1. **Configurable Timeout:**
   - Allow users to adjust candidate filter timeout
   - Add to Settings modal

2. **More Temporal Feedback:**
   - Apply to other actions (mode changes, pause/resume)
   - Customizable animation styles

3. **Error Limit Analytics:**
   - Track how often users hit error limits
   - Suggest difficulty adjustments

4. **Behavior Presets:**
   - Save preferred error limit behavior
   - Auto-apply on future games
