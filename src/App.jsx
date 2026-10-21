import Sidebar from './layouts/sidebar'
import SalesVisualization from './pages/sale-visualization'

function App() {
  return (
    <Sidebar>
      <h2>Dashboard Overview</h2>
      <p>Welcome to the Sales Monitoring dashboard.</p>
      <SalesVisualization/>
    </Sidebar>
  )
}

export default App