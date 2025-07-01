import './App.css'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import PostDetail from './pages/PostDetail'
import PostList from './pages/PostList'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element = {<Home/>}/>
        <Route path='/posts' element = {<PostList/>}/>
        <Route path='/posts/:postId' element = {<PostDetail/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App