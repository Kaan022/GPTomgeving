# NextMatch Intelligence Architecture

## Product rule
NextMatch is not one magical model. It is a traceable chain of specialist models, football definitions, club context and human confirmation.

## Speech
- Prototype: browser SpeechRecognition and SpeechSynthesis.
- Production transcription: `gpt-4o-transcribe`, with a lower-cost mini variant where appropriate.
- Production speech: `gpt-4o-mini-tts` or Realtime speech for interactive debriefs.
- Output schema: facts, interpretations, unresolved questions, interventions, main theme, counter-theme and evaluation criteria.

## Video pipeline
1. FFmpeg creates a 720p analysis proxy while retaining the original securely.
2. RT-DETRv2, fine-tuned on football, detects player, goalkeeper, official, ball and goal geometry.
3. ByteTrack associates detections through time; DINOv2 embeddings help with re-identification after occlusion.
4. A field-line/keypoint model estimates homography and camera pose; temporal camera tracking stabilises the 2D projection.
5. A SoccerNet Game State Reconstruction-compatible layer produces pseudonymous track ID, team, role and pitch coordinates.
6. VideoMAE V2 features feed temporal action-spotting heads for passes, crosses, drives, shots, tackles, restarts and goals.
7. A graph model represents players, ball, zones and team relations.
8. Deterministic, versioned football definitions calculate team length, width, compactness, line height, field tilt, high regains, counterpress duration, 3+2 rest defence and press triggers.
9. Coach AI links clips to club principles, week planning, training interventions and VC evidence.

## Quality gates
- Every event stores model version, source clip, confidence and metric-definition version.
- Low-confidence events require confirmation.
- No biometric identification.
- Individual or talent conclusions always require a qualified human.
- Team-level insights are the default for minors.

## Data moat
The defensible asset is not the interface or a generic language model. It is a consented, labelled amateur-football dataset combined with club-specific principles, coach corrections and outcome feedback.
