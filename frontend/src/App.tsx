import { useAtomValue } from 'jotai'
import { ChildSelectionScreen } from './components/ChildSelectionScreen'
import { HomeScreen } from './components/HomeScreen'
import { LoginScreen } from './components/LoginScreen'
import { SubjectDetail } from './components/SubjectDetail'
import { currentScreenAtom, isAuthenticatedAtom } from './state/atoms'

const App = () => {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom)
  const currentScreen = useAtomValue(currentScreenAtom)

  if (!isAuthenticated) {
    return (
      <div dir="rtl">
        <LoginScreen />
      </div>
    )
  }

  if (currentScreen === 'child-select') {
    return (
      <div dir="rtl">
        <ChildSelectionScreen />
      </div>
    )
  }

  if (currentScreen === 'subject-detail') {
    return (
      <div dir="rtl">
        <SubjectDetail />
      </div>
    )
  }

  return (
    <div dir="rtl">
      <HomeScreen />
    </div>
  )
}

export default App
