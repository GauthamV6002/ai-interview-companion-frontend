import { useCallStateHooks } from "@stream-io/video-react-sdk";

export const MyVideoButton = () => {
  const { useCameraState } = useCallStateHooks();
  const { camera, isMute } = useCameraState();
  return (
    <button onClick={() => camera.toggle()}>
      {isMute ? "Turn on camera" : "Turn off camera"}
    </button>
  );
};