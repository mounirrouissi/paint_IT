import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { loadingOnnxruntime } from './adapters/util'
import { AuthProvider } from './components/auth/AuthContext'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import OAuth2RedirectHandler from './components/auth/oauth2/OAuth2RedirectHandler'

loadingOnnxruntime()

ReactDOM.render(
    <AuthProvider>
    <BrowserRouter>
    <Routes>
    
    <Route path="/" element={<App />} />
    <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler location= {{search:""}}/>} />
          





</Routes>
</BrowserRouter>
</AuthProvider>
, document.getElementById('root'))
