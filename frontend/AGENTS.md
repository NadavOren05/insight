# Insight Project Coding Standards & Rules

## 1. Architecture & Logic Separation
- **Hook-Based Logic**: All component logic, side effects (useEffect), and state management must be extracted into a custom hook located in a separate file (e.g., `useComponentLogic.ts`). 
- **View-Only Components**: React components should remain "thin" and focus solely on the UI/JSX. 
- **Business Logic**: Complex calculations, data transformations, and API interactions (Supabase calls) must reside within hooks or utility services.

## 2. Type Safety (TypeScript)
- **Strict Typing**: The use of `any` is strictly prohibited. Use interfaces or types for all data structures, especially for Supabase schemas and API responses.
- **Utility Types**: Leverage TypeScript utility types (e.g., `Pick`, `Omit`, `Partial`) to maintain DRY (Don't Repeat Yourself) principles in type definitions.
- **Inference**: Allow TypeScript to infer types where obvious, but explicitly define types for hook returns and component props.

## 3. State Management (Jotai)
- **Atoms over Local State**: Use Jotai atoms for shared state (e.g., `activeStudentId`, `currentScreen`).
- **Granular Atoms**: Create small, focused atoms instead of large, complex objects to optimize re-renders.
- **Selectors**: Use `selectAtom` or derived atoms for computing values from existing state.

## 4. Coding Style & Best Practices
- **Functional Components**: Use functional components with arrow function syntax.
- **Destructuring**: Always destructure props and hook returns for better readability.
- **Naming Conventions**: 
    - Components: PascalCase (e.g., `SubjectCard.tsx`).
    - Hooks: camelCase starting with "use" (e.g., `usePracticeSession.ts`).
    - Atoms: camelCase ending with "Atom" (e.g., `userProfileAtom.ts`).
- **Tailwind CSS**: Use Tailwind classes for all styling. Maintain a consistent visual hierarchy as defined in the "Insight" design specs (e.g., Brand Primary `#1A6B5A`).

## 5. Specific Project Constraints (Insight)
- **RTL Support**: Always ensure layouts are RTL-compatible. Use logical properties (e.g., `ps-4` instead of `pl-4`) where possible.
- **Error Handling**: Implement try/catch blocks for all async operations (especially Claude API calls) with meaningful fallbacks as defined in the technical spec.
- **Performance**: Use `React.memo` for expensive UI components and ensure the "AI Loading" state (1.5s delay) is respected to maintain user perceived value.
