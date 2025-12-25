/**
 * Aurora AI Interface Component
 * Main UI for interacting with Aurora AI fashion co-pilot
 */

import React, { useState, useEffect, useRef } from 'react';
import { AuroraAI, FashionContext, OutfitRecommendation } from '../services/aurora-ai.service';

interface AuroraInterfaceProps {
  userId: string;
  onOutfitSelected?: (outfit: OutfitRecommendation) => void;
}

interface Message {
  id: string;
  role: 'user' | 'aurora';
  content: string;
  type?: 'text' | 'outfit' | 'recommendation';
  data?: any;
  timestamp: Date;
}

/**
 * Main Aurora AI Interface Component
 */
export function AuroraInterface({ userId, onOutfitSelected }: AuroraInterfaceProps) {
  const [aurora, setAurora] = useState<AuroraAI | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<Partial<FashionContext>>({});
  const [showContextBuilder, setShowContextBuilder] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Aurora
  useEffect(() => {
    const initAurora = async () => {
      const auroraInstance = new AuroraAI(userId);
      await auroraInstance.initialize();
      setAurora(auroraInstance);

      // Aurora greeting
      setMessages([
        {
          id: '0',
          role: 'aurora',
          content: "✨ Hello! I'm Aurora, your fashion co-pilot. Tell me about your day and I'll create the perfect look for you.",
          type: 'text',
          timestamp: new Date()
        }
      ]);
    };

    initAurora();
  }, [userId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Handle user message
   */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !aurora) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      type: 'text',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // Get Aurora response
      const response = await aurora.chat(inputValue, context as FashionContext);

      // Check if response should trigger outfit generation
      if (shouldGenerateOutfit(inputValue)) {
        const outfit = await aurora.generateOutfit(context as FashionContext);

        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'aurora',
            content: "I've created a personalized outfit for you based on everything you've told me:",
            type: 'text',
            timestamp: new Date()
          },
          {
            id: (Date.now() + 1).toString(),
            role: 'aurora',
            content: outfit.explanation,
            type: 'outfit',
            data: outfit,
            timestamp: new Date()
          }
        ]);
      } else {
        // Regular conversation response
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'aurora',
            content: response,
            type: 'text',
            timestamp: new Date()
          }
        ]);
      }
    } catch (error) {
      console.error('Error getting Aurora response:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if response should generate outfit
   */
  const shouldGenerateOutfit = (message: string): boolean => {
    const keywords = [
      'outfit',
      'what should i wear',
      'help me dress',
      'styling',
      'suggestions',
      'recommendations',
      'look'
    ];
    return keywords.some(kw => message.toLowerCase().includes(kw));
  };

  /**
   * Build context from user input
   */
  const handleContextUpdate = (contextData: Partial<FashionContext>) => {
    setContext(prev => ({ ...prev, ...contextData }));
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Context Builder */}
      {showContextBuilder && (
        <div className="w-80 bg-white shadow-lg overflow-y-auto">
          <ContextBuilder
            context={context}
            onChange={handleContextUpdate}
            onDone={() => setShowContextBuilder(false)}
          />
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">✨ Aurora</h1>
              <p className="text-purple-100">Your Personal Fashion Co-Pilot</p>
            </div>
            <button
              onClick={() => setShowContextBuilder(!showContextBuilder)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              {showContextBuilder ? '⬅️ Hide' : '➡️ Context'}
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map(message => (
            <ChatMessage
              key={message.id}
              message={message}
              onOutfitSelected={onOutfitSelected}
            />
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-800 px-4 py-3 rounded-lg max-w-md">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t bg-white p-6">
          <form onSubmit={handleSendMessage} className="flex space-x-4">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Tell me about your day... Where are you going? What's the vibe?"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </form>

          {/* Quick Prompts */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              '👔 Work Outfit',
              '🏖️ Beach Look',
              '🎉 Party Ready',
              '🚀 Creative Style'
            ].map(prompt => (
              <button
                key={prompt}
                onClick={() => {
                  setInputValue(`Create a ${prompt} for me`);
                }}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Chat Message Component
 */
interface ChatMessageProps {
  message: Message;
  onOutfitSelected?: (outfit: OutfitRecommendation) => void;
}

function ChatMessage({ message, onOutfitSelected }: ChatMessageProps) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="bg-purple-600 text-white px-4 py-3 rounded-lg max-w-md">
          <p>{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="space-y-3 max-w-md">
        {/* Avatar + Text */}
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
              ✨
            </div>
          </div>
          <div className="bg-gray-200 text-gray-900 px-4 py-3 rounded-lg">
            <p>{message.content}</p>
          </div>
        </div>

        {/* Outfit Recommendation */}
        {message.type === 'outfit' && message.data && (
          <OutfitCard
            outfit={message.data}
            onSelect={onOutfitSelected}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Outfit Card Component
 */
interface OutfitCardProps {
  outfit: OutfitRecommendation;
  onSelect?: (outfit: OutfitRecommendation) => void;
}

function OutfitCard({ outfit, onSelect }: OutfitCardProps) {
  return (
    <div className="border border-purple-200 rounded-lg overflow-hidden bg-white shadow-md">
      {/* Outfit Items Grid */}
      <div className="grid grid-cols-2 gap-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50">
        {outfit.items.slice(0, 4).map((item, idx) => (
          <div
            key={idx}
            className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center"
          >
            <img
              src={item.image || '/placeholder.png'}
              alt={item.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-sm font-semibold text-gray-700">Confidence Score</p>
          <div className="mt-1 flex items-center">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                style={{ width: `${outfit.confidenceScore * 100}%` }}
              />
            </div>
            <span className="ml-2 text-sm font-bold">
              {(outfit.confidenceScore * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Emotional Impact */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-gray-600">Confidence</p>
            <p className="font-bold text-purple-600">
              {(outfit.emotionalFitAnalysis.psychologicalComfort.confidenceBoost).toFixed(0)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Comfort</p>
            <p className="font-bold text-pink-600">
              {(outfit.emotionalFitAnalysis.psychologicalComfort.moodImpact.comfort).toFixed(0)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Empowerment</p>
            <p className="font-bold text-purple-600">
              {(outfit.emotionalFitAnalysis.psychologicalComfort.moodImpact.empowerment).toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Action */}
        <button
          onClick={() => onSelect?.(outfit)}
          className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Try This Look ✨
        </button>
      </div>
    </div>
  );
}

/**
 * Context Builder Component
 */
interface ContextBuilderProps {
  context: Partial<FashionContext>;
  onChange: (context: Partial<FashionContext>) => void;
  onDone: () => void;
}

function ContextBuilder({ context, onChange, onDone }: ContextBuilderProps) {
  const occasions = [
    { id: 'business', label: '💼 Business', icon: '💼' },
    { id: 'casual', label: '👕 Casual', icon: '👕' },
    { id: 'formal', label: '🎩 Formal', icon: '🎩' },
    { id: 'evening', label: '🌃 Evening', icon: '🌃' },
    { id: 'weekend', label: '🏖️ Weekend', icon: '🏖️' }
  ];

  const weathers = [
    { id: 'sunny', label: 'Sunny ☀️', icon: '☀️' },
    { id: 'rainy', label: 'Rainy 🌧️', icon: '🌧️' },
    { id: 'snowy', label: 'Snowy ❄️', icon: '❄️' },
    { id: 'cloudy', label: 'Cloudy ☁️', icon: '☁️' }
  ];

  const times = [
    { id: 'morning', label: '🌅 Morning' },
    { id: 'afternoon', label: '☀️ Afternoon' },
    { id: 'evening', label: '🌆 Evening' },
    { id: 'night', label: '🌙 Night' }
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Let's Create Your Context</h2>

      {/* Occasion */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Where are you going?</h3>
        <div className="grid grid-cols-2 gap-2">
          {occasions.map(occ => (
            <button
              key={occ.id}
              onClick={() => onChange({ occasion: occ.id as any })}
              className={`p-3 rounded-lg text-sm font-medium transition-all ${
                context.occasion === occ.id
                  ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {occ.label}
            </button>
          ))}
        </div>
      </div>

      {/* Weather */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">What's the weather?</h3>
        <div className="grid grid-cols-2 gap-2">
          {weathers.map(w => (
            <button
              key={w.id}
              onClick={() => onChange({
                weather: {
                  ...context.weather,
                  conditions: w.id as any,
                  temperature: Math.random() * 30,
                  humidity: Math.random() * 100
                }
              })}
              className={`p-3 rounded-lg text-sm font-medium transition-all ${
                context.weather?.conditions === w.id
                  ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time of Day */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Time of day?</h3>
        <div className="space-y-2">
          {times.map(time => (
            <button
              key={time.id}
              onClick={() => onChange({ timeOfDay: time.id as any })}
              className={`w-full p-3 rounded-lg text-sm font-medium text-left transition-all ${
                context.timeOfDay === time.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {time.label}
            </button>
          ))}
        </div>
      </div>

      {/* Done Button */}
      <button
        onClick={onDone}
        className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity mt-8"
      >
        Ready to Create ✨
      </button>
    </div>
  );
}

export default AuroraInterface;
