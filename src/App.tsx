import { useState } from 'react';
import reactLogo from './assets/react.svg';
import VideoConverter from './components/VideoConverter';
import VideoCutter from './components/VideoCutter';
import { useFfmpeg } from './hooks/useFfmpeg';

function App() {
	const [count, setCount] = useState(0);
	const [loaded, ffmpeg] = useFfmpeg();

	return (
		<div className='App'>
			{/* <VideoConverter></VideoConverter> */}
			<VideoCutter></VideoCutter>
		</div>
	);
}

export default App;
