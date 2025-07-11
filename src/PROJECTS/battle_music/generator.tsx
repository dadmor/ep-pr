import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';

// Define TypeScript interfaces for better type safety
interface ParameterControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  color?: "amber" | "purple" | "blue" | "red" | "green" | "yellow";
}

// Extracted Parameter Control Component with proper TypeScript typing
const ParameterControl: React.FC<ParameterControlProps> = ({ 
  label, 
  value, 
  min, 
  max, 
  step, 
  onChange, 
  color = "amber" 
}) => {
  // Map colors to Tailwind classes
  const colorClasses = {
    amber: "text-amber-500",
    purple: "text-purple-500",
    blue: "text-blue-500",
    red: "text-red-500",
    green: "text-green-500",
    yellow: "text-yellow-500"
  };
  
  // Format the display value to 2 decimal places if needed
  const displayValue = Number.isInteger(value) ? value : value.toFixed(2);
  
  return (
    <div className="flex flex-col items-center mx-1">
      <div className="flex items-center">
        <button 
          className="w-6 h-6 rounded-l-md bg-gray-800 hover:bg-gray-700 text-sm flex items-center justify-center"
          onClick={() => onChange(Math.max(min, value - step))}
          aria-label={`Decrease ${label}`}
        >−</button>
        <div className={`w-10 h-6 bg-gray-700 flex items-center justify-center text-xs font-bold ${colorClasses[color]}`}>
          {displayValue}
        </div>
        <button 
          className="w-6 h-6 rounded-r-md bg-gray-800 hover:bg-gray-700 text-sm flex items-center justify-center"
          onClick={() => onChange(Math.min(max, value + step))}
          aria-label={`Increase ${label}`}
        >+</button>
      </div>
      <span className="text-xs mt-1">{label}</span>
    </div>
  );
};

// Define interface for instrument parameters
interface InstrumentParams {
  [key: string]: number;
}

// Define interface for all instruments
interface Instruments {
  lead: InstrumentParams;
  pad: InstrumentParams;
  bass: InstrumentParams;
  kick: InstrumentParams;
  snare: InstrumentParams;
  hihat: InstrumentParams;
}

// Define interface for parameter configuration
interface ParamConfig {
  min: number;
  max: number;
  step: number;
  label: string;
}

// Define interface for patterns
interface Patterns {
  bass: any[] | null;
  kick: number[] | null;
  snare: number[] | null;
  hihat: number[] | null;
  lead: any[] | null;
  pad: any[] | null;
}

// Main component
export default function DuneHarkonnenMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(-10);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentTakt, setCurrentTakt] = useState(1);
  
  // Parameters with real value ranges for each instrument
  const [instruments, setInstruments] = useState<Instruments>({
    lead: { volume: 0, tone: 0.5, decay: 0.2, pitch: 0 },
    pad: { volume: 0, tone: 0.5, attack: 0.8, release: 1.2 },
    bass: { volume: 0, tone: 0.5, depth: 0.4, drive: 0.5 },
    kick: { volume: 0, punch: 0.5, decay: 0.2, tone: 0.5 },
    snare: { volume: 0, snap: 0.5, tone: 0.5, decay: 0.2 },
    hihat: { volume: 0, decay: 0.1, tone: 0.5, pitch: 0.5 }
  });
  
  // Parameter configurations for controls
  const paramConfig = {
    lead: {
      volume: { min: -20, max: 10, step: 1, label: "Vol" },
      tone: { min: 0, max: 1, step: 0.1, label: "Tone" },
      decay: { min: 0.1, max: 1.1, step: 0.1, label: "Decay" },
      pitch: { min: -12, max: 12, step: 1, label: "Pitch" }
    },
    pad: {
      volume: { min: -20, max: 10, step: 1, label: "Vol" },
      tone: { min: 0, max: 1, step: 0.1, label: "Tone" },
      attack: { min: 0.1, max: 3, step: 0.1, label: "Attack" },
      release: { min: 0.3, max: 3, step: 0.1, label: "Release" }
    },
    bass: {
      volume: { min: -20, max: 10, step: 1, label: "Vol" },
      tone: { min: 0, max: 1, step: 0.1, label: "Tone" },
      depth: { min: 0.2, max: 1, step: 0.1, label: "Depth" },
      drive: { min: 0, max: 1, step: 0.1, label: "Drive" }
    },
    kick: {
      volume: { min: -20, max: 10, step: 1, label: "Vol" },
      punch: { min: 0, max: 1, step: 0.1, label: "Punch" },
      decay: { min: 0.1, max: 0.6, step: 0.05, label: "Decay" },
      tone: { min: 0, max: 1, step: 0.1, label: "Tone" }
    },
    snare: {
      volume: { min: -20, max: 10, step: 1, label: "Vol" },
      snap: { min: 0, max: 1, step: 0.1, label: "Snap" },
      tone: { min: 0, max: 1, step: 0.1, label: "Tone" },
      decay: { min: 0.1, max: 0.6, step: 0.05, label: "Decay" }
    },
    hihat: {
      volume: { min: -30, max: 0, step: 1, label: "Vol" },
      decay: { min: 0.01, max: 0.21, step: 0.02, label: "Decay" },
      tone: { min: 0, max: 1, step: 0.1, label: "Tone" },
      pitch: { min: 0, max: 1, step: 0.1, label: "Pitch" }
    }
  };
  

  
  // We use ref to store values that need to be accessible in timers
  const playerRef = useRef({
    taktCounter: 1,
    sectionCounter: 0,
    intervalId: null as number | null,
    cleanup: null as (() => void) | null
  });
  
  // References to effects
  const effectsRef = useRef({
    filters: {} as Record<string, Tone.Filter>,
    reverb: null as Tone.Reverb | null,
    leadPitchOffset: 0
  });
  
  // Musical patterns to display
  const [patterns, setPatterns] = useState<Patterns>({
    bass: null,
    kick: null,
    snare: null,
    hihat: null,
    lead: null,
    pad: null
  });
  
  // Main instruments
  const [synths, setSynths] = useState<any>(null);
  const [drums, setDrums] = useState<any>(null);
  const [bassline, setBassline] = useState<any>(null);
  
  // Initialize synthesizers and instruments
  useEffect(() => {
    // Set loading progress
    setLoadingProgress(10);
    
    // Main mixer
    const mainGain = new Tone.Gain(0.7).toDestination(); // Reduced overall volume
    
    // Main reverb (shared)
    const reverb = new Tone.Reverb({
      decay: 1.2,
      wet: 0.15
    }).connect(mainGain);
    
    // Filters for each instrument
    const filters: { [key: string]: Tone.Filter } = {
        lead: new Tone.Filter(2000, "lowpass"),
        pad: new Tone.Filter(1000, "lowpass"),
        bass: new Tone.Filter(600, "lowpass"),
        kick: new Tone.Filter(800, "lowpass"),
        snare: new Tone.Filter(3000, "highpass"),
        hihat: new Tone.Filter(5000, "highpass")
      };
    
    // Effect chain for each instrument
    Object.keys(filters).forEach(instrument => {
      filters[instrument].connect(reverb);
    });
    
    // Save references to effects
    effectsRef.current = {
      filters,
      reverb,
      leadPitchOffset: 0
    };
    
    setLoadingProgress(30);
    
    // Main synthesizers
    const leadSynth = new Tone.Synth({
      oscillator: {
        type: 'sawtooth'
      },
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.2,
        release: 0.5
      }
    }).connect(filters.lead);
    
    const padSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'sine'
      },
      envelope: {
        attack: 0.8,
        decay: 0.2,
        sustain: 0.4, // Less sustain for pads
        release: 1.2   // Shorter release
      }
    }).connect(filters.pad);
    padSynth.volume.value = -5; // Reduced volume for pads
    
    const bassSynth = new Tone.Synth({
      oscillator: {
        type: 'triangle'
      },
      envelope: {
        attack: 0.05,
        decay: 0.2,
        sustain: 0.4,
        release: 0.1
      }
    }).connect(filters.bass);
    
    setLoadingProgress(50);
    
    // Percussion
    const kickDrum = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: {
        type: 'sine'
      },
      envelope: {
        attack: 0.001,
        decay: 0.2,
        sustain: 0.01,
        release: 0.8,
        attackCurve: 'exponential'
      }
    }).connect(filters.kick);
    
    const snareDrum = new Tone.NoiseSynth({
      noise: {
        type: 'white'
      },
      envelope: {
        attack: 0.001,
        decay: 0.2,
        sustain: 0.01,
        release: 0.2
      }
    }).connect(filters.snare);
    
    const hihat = new Tone.MetalSynth({
  
      envelope: {
        attack: 0.001,
        decay: 0.1,
        release: 0.01
      },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5
    }).connect(filters.hihat);
    hihat.volume.value = -18; // More muted hi-hat
    
    setLoadingProgress(70);
    
    // Save instruments to state
    setSynths({
      lead: leadSynth,
      pad: padSynth,
      mainGain
    });
    
    setDrums({
      kick: kickDrum,
      snare: snareDrum,
      hihat: hihat
    });
    
    setBassline({
      bass: bassSynth
    });
    
    setLoadingProgress(90);
    
    // Mark everything as loaded after a short delay
    setTimeout(() => {
      setIsLoaded(true);
      setLoadingProgress(100);
    }, 1000);
    
    // Cleanup when component unmounts
    return () => {
      if (playerRef.current.cleanup) {
        playerRef.current.cleanup();
      }
      if (playerRef.current.intervalId) {
        clearInterval(playerRef.current.intervalId);
      }
      
      leadSynth.dispose();
      padSynth.dispose();
      bassSynth.dispose();
      kickDrum.dispose();
      snareDrum.dispose();
      hihat.dispose();
      
      // Clean up effects
      Object.values(filters).forEach(filter => filter.dispose());
      reverb.dispose();
      mainGain.dispose();
    };
  }, []);
  
  // Modulation effects
  useEffect(() => {
    if (!synths || !drums || !bassline) return;
    
    // Update instrument parameters
    const { lead, pad, bass, kick, snare, hihat } = instruments;
    
    // Update lead synth
    if (synths.lead) {
      synths.lead.volume.value = lead.volume;
      
      // Change oscillator type based on tone parameter
      if (lead.tone >= 0.66) {
        synths.lead.oscillator.type = 'sawtooth';
      } else if (lead.tone >= 0.33) {
        synths.lead.oscillator.type = 'square';
      } else {
        synths.lead.oscillator.type = 'triangle';
      }
      
      // Change decay
      synths.lead.envelope.decay = lead.decay;
      
      // Transpose pitch (semitones)
      if (Math.abs(lead.pitch) > 0) {
        effectsRef.current.leadPitchOffset = lead.pitch;
      } else {
        effectsRef.current.leadPitchOffset = 0;
      }
    }
    
    // Update pad synth
    if (synths.pad) {
      synths.pad.volume.value = pad.volume;
      
      // Change attack and release
      synths.pad.set({
        envelope: {
          attack: pad.attack,
          release: pad.release
        }
      });
      
      // Change oscillator type for pads
      if (pad.tone >= 0.66) {
        synths.pad.set({ oscillator: { type: 'sine' } });
      } else if (pad.tone >= 0.33) {
        synths.pad.set({ oscillator: { type: 'triangle' } });
      } else {
        synths.pad.set({ oscillator: { type: 'sine' } });
      }
    }
    
    // Update bass synth
    if (bassline.bass) {
      bassline.bass.volume.value = bass.volume;
      
      // Change tone/timbre
      if (bass.tone >= 0.66) {
        bassline.bass.oscillator.type = 'triangle';
      } else if (bass.tone >= 0.33) {
        bassline.bass.oscillator.type = 'square';
      } else {
        bassline.bass.oscillator.type = 'sine';
      }
      
      // Change depth/sustain
      bassline.bass.envelope.sustain = bass.depth;
      
      // Change filter
      if (effectsRef.current.filters.bass) {
        effectsRef.current.filters.bass.frequency.value = 300 + bass.drive * 700;
      }
    }
    
    // Update kick
    if (drums.kick) {
      drums.kick.volume.value = kick.volume;
      
      // Punch (attack & sustain)
      drums.kick.envelope.attack = Math.max(0.001, 0.001 * (1 - kick.punch));
      drums.kick.envelope.decay = kick.decay;
      
      // Change tone
      if (effectsRef.current.filters.kick) {
        effectsRef.current.filters.kick.frequency.value = 100 + kick.tone * 1000;
      }
    }
    
    // Update snare
    if (drums.snare) {
      drums.snare.volume.value = snare.volume;
      
      // Snap (attack)
      drums.snare.envelope.attack = Math.max(0.001, 0.001 * (1 - snare.snap));
      
      // Tone (noise type)
      if (snare.tone >= 0.66) {
        drums.snare.noise.type = 'white';
      } else if (snare.tone >= 0.33) {
        drums.snare.noise.type = 'pink';
      } else {
        drums.snare.noise.type = 'brown';
      }
      
      // Decay
      drums.snare.envelope.decay = snare.decay;
    }
    
    // Update hi-hat
    if (drums.hihat) {
      drums.hihat.volume.value = hihat.volume;
      
      // Decay
      drums.hihat.envelope.decay = hihat.decay;
      
      // Tone (modification by harmonicity)
      drums.hihat.harmonicity = 3 + hihat.tone * 8;
      
      // Pitch (frequency change)
      drums.hihat.frequency.value = 200 * Math.pow(2, hihat.pitch * 2);
    }
    
  }, [instruments, synths, drums, bassline]);
  
  // Function to control master volume
  useEffect(() => {
    if (synths) {
      synths.mainGain.gain.value = Tone.dbToGain(volume);
    }
  }, [volume, synths]);
  
  // The Harkonnen Theme - dark and intense, with organized structure
  const playHarkonnenTheme = async () => {
    if (!synths || !drums || !bassline || isPlaying) return;
    
    await Tone.start();
    setIsPlaying(true);
    
    // Reset counters
    playerRef.current.taktCounter = 1;
    playerRef.current.sectionCounter = 0;
    setCurrentTakt(1);
    setCurrentSection(0);
    
    // Battle tempo
    Tone.Transport.bpm.value = 130;
    
    // Organized music sections instead of random variations
    const section1BassPart = ['C2', 'C2', 'G1', 'C2', 'C2', 'C2', 'G1', 'C2'];
    const section2BassPart = ['C2', 'C2', 'Eb2', 'G1', 'C2', 'Bb1', 'G1', 'C2'];
    const section3BassPart = ['C2', 'C2', 'G1', 'G1', 'Bb1', 'C2', 'G1', 'C2'];
    
    const section1KickPart = [1, 0, 0, 1, 0, 1, 0, 0];
    const section2KickPart = [1, 0, 1, 1, 0, 1, 0, 0];
    const section3KickPart = [1, 0, 0, 1, 1, 0, 1, 0];
    
    const section1SnarePart = [0, 0, 1, 0, 0, 0, 1, 0];
    const section2SnarePart = [0, 0, 1, 0, 1, 0, 1, 0];
    const section3SnarePart = [0, 1, 1, 0, 0, 1, 1, 0];
    
    const section1LeadPart = ['C4', 'Eb4', 'G3', 'Bb3', 'C4', 'G3', 'Bb3', 'C4'];
    const section2LeadPart = ['C4', 'Eb4', 'G3', 'C4', 'Eb4', 'D4', 'Bb3', 'G3'];
    const section3LeadPart = ['Eb4', 'G4', 'Bb3', 'C4', 'G3', 'Bb3', 'C4', 'D4'];
    
    // Symphonic variations of the melody (organized, not random)
    const symphonicLeadPart = ['C4', 'Eb4', 'G4', null, 'C4', null, 'Bb3', 'C4'];
    
    // Organized chord structure for each section
    const section1PadPart = [['C3', 'Eb3', 'G3'], ['G2', 'Bb2', 'D3'], ['Bb2', 'D3', 'F3'], ['C3', 'Eb3', 'G3']];
    const section2PadPart = [['C3', 'Eb3', 'G3'], ['Ab2', 'C3', 'Eb3'], ['Bb2', 'D3', 'F3'], ['G2', 'Bb2', 'D3']];
    const section3PadPart = [['C3', 'Eb3', 'G3', 'Bb3'], ['G2', 'Bb2', 'D3', 'F3'], ['Eb3', 'G3', 'Bb3'], ['C3', 'G3', 'C4']];
    
    // Set initial patterns
    setPatterns({
      bass: section1BassPart,
      kick: section1KickPart,
      snare: section1SnarePart,
      hihat: [1, 1, 1, 1, 1, 1, 1, 1],
      lead: section1LeadPart,
      pad: section1PadPart
    });
    
    // Helper function to transpose a note
    const transposeNote = (note: string | null, semitones: number): string | null => {
      if (!note || semitones === 0) return note;
      
      // Simple mapping of note names to numeric values
      const noteToNum: Record<string, number> = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 
        'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 
        'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
      };
      
      const numToNote = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      
      // Extract note name and octave
      const match = note.match(/([A-G][b#]?)(\d+)/);
      if (!match) return note;
      
      const noteName = match[1];
      const octave = parseInt(match[2]);
      
      // Convert to MIDI number
      let noteNum = noteToNum[noteName] + (octave + 1) * 12;
      
      // Transpose
      noteNum += semitones;
      
      // Convert back to note name and octave
      const newOctave = Math.floor(noteNum / 12) - 1;
      const newNoteName = numToNote[noteNum % 12];
      
      return `${newNoteName}${newOctave}`;
    };
    
    // Create sequences
    const bassPattern = new Tone.Sequence((time, note) => {
      if (note) {
        bassline.bass.triggerAttackRelease(note, "8n", time);
      }
    }, section1BassPart, "8n");
    
    const kickPattern = new Tone.Sequence((time, note) => {
      if (note) drums.kick.triggerAttackRelease('C1', '8n', time);
    }, section1KickPart, "8n");
    
    const snarePattern = new Tone.Sequence((time, note) => {
      if (note) drums.snare.triggerAttackRelease('16n', time);
    }, section1SnarePart, "8n");
    
    const hihatPattern = new Tone.Sequence((time, note) => {
      if (note) drums.hihat.triggerAttackRelease('32n', time, 0.3);
    }, [1, 1, 1, 1, 1, 1, 1, 1], "8n");
    
    // Add transposition handling for melody
    const leadPattern = new Tone.Sequence((time, note) => {
      if (note) {
        // Check if we need to apply transposition
        const pitchOffset = effectsRef.current.leadPitchOffset || 0;
        const transposedNote = transposeNote(note, pitchOffset);
        synths.lead.triggerAttackRelease(transposedNote, "8n", time);
      }
    }, section1LeadPart, "4n");
    
    const padPattern = new Tone.Sequence((time, chord) => {
      if (chord) {
        synths.pad.triggerAttackRelease(chord, "2n", time);
      }
    }, section1PadPart, "1n");
    
    // Function to update takt and section
    const updateTaktAndSection = () => {
      // Increase takt counter
      playerRef.current.taktCounter += 1;
      setCurrentTakt(playerRef.current.taktCounter);
      
      // Every 8 takts, change section
      if (playerRef.current.taktCounter % 8 === 1 && playerRef.current.taktCounter > 1) {
        // Increase section counter
        playerRef.current.sectionCounter = (playerRef.current.sectionCounter + 1) % 5;
        setCurrentSection(playerRef.current.sectionCounter);
        
        let newBassPattern, newKickPattern, newSnarePattern, newLeadPattern, newPadPattern;
        
        switch(playerRef.current.sectionCounter) {
          case 0: // Intro / Section 1
            newBassPattern = section1BassPart;
            newKickPattern = section1KickPart;
            newSnarePattern = section1SnarePart;
            newLeadPattern = section1LeadPart;
            newPadPattern = section1PadPart;
            break;
          case 1: // Section 2
            newBassPattern = section2BassPart;
            newKickPattern = section2KickPart;
            newSnarePattern = section2SnarePart;
            newLeadPattern = section2LeadPart;
            newPadPattern = section2PadPart;
            break;
          case 2: // Section 3
            newBassPattern = section3BassPart;
            newKickPattern = section3KickPart;
            newSnarePattern = section3SnarePart;
            newLeadPattern = section3LeadPart;
            newPadPattern = section3PadPart;
            break;
          case 3: // Symphonic transition (only change melody)
            // Keep accompaniment
            newBassPattern = section1BassPart;
            newKickPattern = section1KickPart;
            newSnarePattern = section1SnarePart;
            // Change only melody to symphonic
            newLeadPattern = symphonicLeadPart;
            newPadPattern = section1PadPart;
            break;
          case 4: // Return to intro
            newBassPattern = section1BassPart;
            newKickPattern = section1KickPart;
            newSnarePattern = section1SnarePart;
            newLeadPattern = section1LeadPart;
            newPadPattern = section1PadPart;
            break;
          default:
            newBassPattern = section1BassPart;
            newKickPattern = section1KickPart;
            newSnarePattern = section1SnarePart;
            newLeadPattern = section1LeadPart;
            newPadPattern = section1PadPart;
        }
        
        // Update sequences
        bassPattern.events = newBassPattern;
        kickPattern.events = newKickPattern;
        snarePattern.events = newSnarePattern;
        leadPattern.events = newLeadPattern;
        padPattern.events = newPadPattern;
        
        // Update displayed patterns
        setPatterns({
          bass: newBassPattern,
          kick: newKickPattern,
          snare: newSnarePattern,
          hihat: [1, 1, 1, 1, 1, 1, 1, 1],
          lead: newLeadPattern,
          pad: newPadPattern
        });
      }
      
      // Every 4 takts add percussion transition (fill)
      if (playerRef.current.taktCounter % 4 === 0) {
        const fillPattern = [1, 1, 1, 1, 0, 1, 1, 1];
        const originalEvents = [...snarePattern.events];
        
        // Show fill in interface
        setPatterns(prev => ({
          ...prev,
          snare: fillPattern
        }));
        
        // Update sequence
        snarePattern.events = fillPattern;
        
        // Restore original pattern after 2 seconds
        setTimeout(() => {
          if (snarePattern.events) {
            snarePattern.events = originalEvents;
            
            // Restore original pattern in interface
            setPatterns(prev => ({
              ...prev,
              snare: originalEvents
            }));
          }
        }, 2000);
      }
    };
    
    // Calculate takt length in milliseconds at BPM 130
    // BPM 130 = 130 quarter notes per minute
    // 1 takt = 4 quarter notes
    // 60000 ms / 130 * 4 = approx. 1846 ms per takt
    const msPerTakt = Math.floor(60000 / 130 * 4);
    
    // Start sequences
    bassPattern.start(0);
    kickPattern.start(0);
    snarePattern.start(0);
    hihatPattern.start(0);
    leadPattern.start(0);
    padPattern.start(0);
    
    // Start transport
    Tone.Transport.start();
    
    // Set timer to update takt
    const intervalId = window.setInterval(updateTaktAndSection, msPerTakt);
    playerRef.current.intervalId = intervalId;
    
    // Save cleanup function
    playerRef.current.cleanup = () => {
      clearInterval(intervalId);
      bassPattern.dispose();
      kickPattern.dispose();
      snarePattern.dispose();
      hihatPattern.dispose();
      leadPattern.dispose();
      padPattern.dispose();
      Tone.Transport.stop();
    };
  };
  
  // Stop music
  const stopMusic = () => {
    if (playerRef.current.cleanup) {
      playerRef.current.cleanup();
      playerRef.current.cleanup = null;
    }
    
    if (playerRef.current.intervalId) {
      clearInterval(playerRef.current.intervalId);
      playerRef.current.intervalId = null;
    }
    
    Tone.Transport.stop();
    setIsPlaying(false);
  };
  
  // Helper function to display patterns
  const renderPattern = (pattern: any[] | null, type: string) => {
    if (!pattern) return null;
    
    // Display different pattern types
    if (type === 'pad') {
      return (
        <div className="grid grid-cols-4 gap-1 mt-1">
          {pattern.map((chord, idx) => (
            <div key={idx} className="bg-gray-800 rounded px-2 py-1 text-xs">
              {Array.isArray(chord) ? chord.join(', ') : chord || '-'}
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <div className="flex space-x-1 mt-1">
        {pattern.map((item, idx) => (
          <div 
            key={idx} 
            className={`w-8 h-8 flex items-center justify-center rounded ${
              item ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-600'
            }`}
          >
            {item === 0 || item === 1 ? item : item || '-'}
          </div>
        ))}
      </div>
    );
  };
  
  // Helper to update an instrument parameter
  const updateInstrumentParam = (instrument: keyof Instruments, param: string, value: number) => {
    setInstruments(prev => ({
      ...prev,
      [instrument]: {
        ...prev[instrument],
        [param]: value
      }
    }));
  };
  
  // ---- COMPONENT RENDER ----
  return (
    <div className="p-4 max-w-4xl mx-auto bg-gray-900 rounded-lg shadow-lg text-gray-100">
      <h2 className="text-2xl font-bold text-center mb-4 text-amber-500">House Harkonnen Theme (Dune)</h2>
      
      {!isLoaded ? (
        <div className="my-8 text-center">
          <div className="w-full bg-gray-700 rounded-full h-4 mb-3">
            <div 
              className="bg-amber-500 h-4 rounded-full transition-all duration-300" 
              style={{width: `${loadingProgress}%`}}
            ></div>
          </div>
          <p>Loading synthesizers... {loadingProgress}%</p>
        </div>
      ) : (
        <>
          {/* Control panel */}
          <div className="mb-4 flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
            <button 
              onClick={playHarkonnenTheme} 
              disabled={isPlaying}
              className={`px-6 py-2 rounded-lg shadow hover:shadow-lg transition-all duration-300 
                bg-red-900 text-gray-200 hover:bg-red-800
                disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label="Play Harkonnen Theme"
            >
              ▶ Play Harkonnen Theme
            </button>
            
            <button 
              onClick={stopMusic} 
              disabled={!isPlaying}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Stop Music"
            >
              ■ Stop
            </button>
            
            {/* Volume control */}
            <div className="flex items-center ml-4">
              <span className="mr-2 text-sm">Volume:</span>
              <input
                type="range"
                min="-40"
                max="0"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-36 h-2 rounded-lg appearance-none cursor-pointer bg-gray-700"
                aria-label="Master Volume"
              />
              <span className="ml-2 text-sm w-8">{volume} dB</span>
            </div>
          </div>
          
          {/* Sound modulators */}
          <div className="mb-4 p-3 bg-gray-800 rounded-lg">
            <h3 className="text-sm font-bold text-amber-400 mb-2">Channel Modulation:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {/* Lead synth */}
              <div className="p-2 bg-gray-900 rounded-lg">
                <div className="text-xs font-bold text-amber-500 mb-2">LEAD:</div>
                <div className="flex justify-center mb-2">
                  {Object.entries(paramConfig.lead).map(([param, config]) => (
                    <ParameterControl
                      key={`lead-${param}`}
                      label={config.label}
                      value={instruments.lead[param]}
                      min={config.min}
                      max={config.max}
                      step={config.step}
                      onChange={(val) => updateInstrumentParam('lead', param, val)}
                      color="amber"
                    />
                  ))}
                </div>
              </div>
              
              {/* Pad synth */}
              <div className="p-2 bg-gray-900 rounded-lg">
                <div className="text-xs font-bold text-purple-500 mb-2">PAD:</div>
                <div className="flex justify-center mb-2">
                  {Object.entries(paramConfig.pad).map(([param, config]) => (
                    <ParameterControl
                      key={`pad-${param}`}
                      label={config.label}
                      value={instruments.pad[param]}
                      min={config.min}
                      max={config.max}
                      step={config.step}
                      onChange={(val) => updateInstrumentParam('pad', param, val)}
                      color="purple"
                    />
                  ))}
                </div>
              </div>
              
              {/* Bass synth */}
              <div className="p-2 bg-gray-900 rounded-lg">
                <div className="text-xs font-bold text-blue-500 mb-2">BASS:</div>
                <div className="flex justify-center mb-2">
                  {Object.entries(paramConfig.bass).map(([param, config]) => (
                    <ParameterControl
                      key={`bass-${param}`}
                      label={config.label}
                      value={instruments.bass[param]}
                      min={config.min}
                      max={config.max}
                      step={config.step}
                      onChange={(val) => updateInstrumentParam('bass', param, val)}
                      color="blue"
                    />
                  ))}
                </div>
              </div>
              
              {/* Kick */}
              <div className="p-2 bg-gray-900 rounded-lg">
                <div className="text-xs font-bold text-red-500 mb-2">KICK:</div>
                <div className="flex justify-center mb-2">
                  {Object.entries(paramConfig.kick).map(([param, config]) => (
                    <ParameterControl
                      key={`kick-${param}`}
                      label={config.label}
                      value={instruments.kick[param]}
                      min={config.min}
                      max={config.max}
                      step={config.step}
                      onChange={(val) => updateInstrumentParam('kick', param, val)}
                      color="red"
                    />
                  ))}
                </div>
              </div>
              
              {/* Snare */}
              <div className="p-2 bg-gray-900 rounded-lg">
                <div className="text-xs font-bold text-green-500 mb-2">SNARE:</div>
                <div className="flex justify-center mb-2">
                  {Object.entries(paramConfig.snare).map(([param, config]) => (
                    <ParameterControl
                      key={`snare-${param}`}
                      label={config.label}
                      value={instruments.snare[param]}
                      min={config.min}
                      max={config.max}
                      step={config.step}
                      onChange={(val) => updateInstrumentParam('snare', param, val)}
                      color="green"
                    />
                  ))}
                </div>
              </div>
              
              {/* Hi-hat */}
              <div className="p-2 bg-gray-900 rounded-lg">
                <div className="text-xs font-bold text-yellow-500 mb-2">HI-HAT:</div>
                <div className="flex justify-center mb-2">
                  {Object.entries(paramConfig.hihat).map(([param, config]) => (
                    <ParameterControl
                      key={`hihat-${param}`}
                      label={config.label}
                      value={instruments.hihat[param]}
                      min={config.min}
                      max={config.max}
                      step={config.step}
                      onChange={(val) => updateInstrumentParam('hihat', param, val)}
                      color="yellow"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Playback status */}
          {isPlaying && (
            <div className="mb-4 text-center">
              <div className="animate-pulse mb-2">
                <p className="text-lg">Now Playing: House Harkonnen Theme</p>
                <div className="flex justify-center mt-2 space-x-1">
                  {Array(5).fill(0).map((_, i) => (
                    <div 
                      key={i} 
                      className="bg-red-500 rounded-full"
                      style={{
                        width: '4px',
                        height: `${15 + Math.floor(Math.random() * 20)}px`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    ></div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center items-center space-x-4">
                <div className="bg-gray-800 px-3 py-2 rounded-lg">
                  <p className="text-sm text-gray-400">Section</p>
                  <p className="text-xl font-bold">{
                    currentSection === 0 ? "1 (Intro)" :
                    currentSection === 1 ? "2" :
                    currentSection === 2 ? "3" :
                    currentSection === 3 ? "4 (Symphonic)" :
                    "5 (Return)"
                  }</p>
                </div>
                <div className="bg-gray-800 px-3 py-2 rounded-lg">
                  <p className="text-sm text-gray-400">Takt</p>
                  <p className="text-xl font-bold">{currentTakt}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Music pattern visualization */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left column */}
            <div>
              <h3 className="text-lg font-bold text-amber-400 mb-2">Melody and Harmony:</h3>
              
              <div className="mb-3 bg-gray-800 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Lead (melody):</span>
                </div>
                {renderPattern(patterns.lead, 'lead')}
              </div>
              
              <div className="mb-3 bg-gray-800 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Pad (chords):</span>
                </div>
                {renderPattern(patterns.pad, 'pad')}
              </div>
              
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Bass:</span>
                </div>
                {renderPattern(patterns.bass, 'bass')}
              </div>
            </div>
            
            {/* Right column */}
            <div>
              <h3 className="text-lg font-bold text-amber-400 mb-2">Percussion:</h3>
              
              <div className="mb-3 bg-gray-800 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Kick:</span>
                </div>
                {renderPattern(patterns.kick, 'kick')}
              </div>
              
              <div className="mb-3 bg-gray-800 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Snare:</span>
                </div>
                {renderPattern(patterns.snare, 'snare')}
              </div>
              
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Hi-hat:</span>
                </div>
                {renderPattern(patterns.hihat, 'hihat')}
              </div>
            </div>
          </div>
          
          {/* Theme information */}
          <div className="mt-4 p-3 bg-gray-800 rounded-lg text-sm">
            <h3 className="font-bold mb-2 text-amber-400">About the Harkonnen Theme:</h3>
            <p className="mb-2">
              A dark and intense musical theme inspired by the Dune universe. 
              This theme represents House Harkonnen - ruthless, brutal, and disciplined.
            </p>
            <p className="mb-2">
              The theme consists of 5 sections, played in a set sequence:
            </p>
            <ol className="list-decimal pl-5 space-y-1">
              <li><span className="text-red-400">Intro (Section 1)</span> - basic motif in C minor</li>
              <li><span className="text-red-400">Section 2</span> - variant with alternative bass line and increased percussion intensity</li>
              <li><span className="text-red-400">Section 3</span> - culmination with more complex harmony and rhythm</li>
              <li><span className="text-red-400">Symphonic transition</span> - symphonic melody with Section 1 accompaniment</li>
              <li><span className="text-red-400">Return to Intro</span> - closing the cycle and starting over</li>
            </ol>
          </div>
        </>
      )}
    </div>
  );
}