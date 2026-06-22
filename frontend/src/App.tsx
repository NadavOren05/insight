import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes/AppRoutes'

const App = () => {
  return (
    <BrowserRouter>
      <div dir="rtl">
        <AppRoutes />
      </div>
    </BrowserRouter>
  )
}

export default App
