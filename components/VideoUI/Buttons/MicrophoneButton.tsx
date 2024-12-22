import { useCallStateHooks } from "@stream-io/video-react-sdk";

export const MyMicrophoneButton = () => {
    const { useMicrophoneState } = useCallStateHooks();
    const { microphone, isMute } = useMicrophoneState();
    return (
      <button onClick={() => microphone.toggle()}>
        {isMute ? "Turn on microphone" : "Turn off microphone"}
      </button>
    );
  };