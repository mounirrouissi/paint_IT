import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { loadingOnnxruntime } from './adapters/util'
import { AuthProvider } from './components/auth/AuthContext'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import OAuth2RedirectHandler from './components/auth/oauth2/OAuth2RedirectHandler'
import CheckoutPage from './components/payment/SubscriptionPlan'
import SubscriptionPlan from './components/payment/SubscriptionPlan'
import Success from './components/payment/Success'
import Failure from './components/payment/Failure'
import { PlayGroundLayout } from './PlayGroundLayout'
import Editor from './Editor'

loadingOnnxruntime()

ReactDOM.render(
    
    <AuthProvider>
    <BrowserRouter>
    <Routes>
    
    <Route path="/" element={<App />} />
    
    <Route path="/checkout" element={<SubscriptionPlan />} />
    <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler location= {{search:""}}/>} />
    {/* Stripe pages       */}
    <Route path="/success" element={<Success />} />
    <Route path="/failure" element={<Failure />} />





</Routes>
</BrowserRouter>
</AuthProvider>
, document.getElementById('root'))
