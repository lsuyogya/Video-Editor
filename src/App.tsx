import { useState } from 'react';
import VideoConverter from './components/VideoConverter';

function App() {
	const [count, setCount] = useState(0);

	return (
		<div className='App'>
			<VideoConverter></VideoConverter>
			{/* <Timeline></Timeline> */}
		</div>
	);
}

export default App;
