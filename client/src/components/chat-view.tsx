import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HelpCircle, MessageCircle, Plus, Mic, Send, Users } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { ChatRoom, ChatMessage, User } from "@shared/schema";

type MessageWithSender = ChatMessage & {
  sender: User;
};

export default function ChatView() {
  const { user } = useAuth();
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: rooms = [] } = useQuery<ChatRoom[]>({
    queryKey: ["/api/chat/rooms"],
  });

  const { data: messages = [] } = useQuery<MessageWithSender[]>({
    queryKey: ["/api/chat/rooms", selectedRoomId, "messages"],
    enabled: !!selectedRoomId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ roomId, content }: { roomId: number; content: string }) => {
      const res = await apiRequest("POST", `/api/chat/rooms/${roomId}/messages`, { content });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/rooms", selectedRoomId, "messages"] });
      setNewMessage("");
    },
  });

  // WebSocket connection for real-time chat
  useEffect(() => {
    if (selectedRoomId) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        wsRef.current?.send(JSON.stringify({ type: 'join_room', roomId: selectedRoomId }));
      };
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'new_message') {
          queryClient.invalidateQueries({ queryKey: ["/api/chat/rooms", selectedRoomId, "messages"] });
        }
      };
      
      return () => {
        wsRef.current?.close();
      };
    }
  }, [selectedRoomId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedRoomId) return;
    sendMessageMutation.mutate({ roomId: selectedRoomId, content: newMessage });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Default chat rooms if none exist
  const defaultRooms = [
    { id: 1, name: "Pet Care FAQ", type: "faq", description: "Get answers to common pet care questions" },
    { id: 2, name: "General Chat", type: "general", description: "Connect with other pet parents" }
  ];

  const allRooms = rooms.length > 0 ? rooms : defaultRooms;

  if (!selectedRoomId) {
    return (
      <div className="p-4 space-y-6">
        <h2 className="text-xl font-bold text-dark-slate">Messages</h2>
        
        {/* Chat Rooms */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => setSelectedRoomId(1)}
            className="bg-primary hover:bg-primary/90 text-white py-4 px-4 rounded-full flex items-center justify-center space-x-2"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Pet Care FAQ</span>
          </Button>
          <Button
            onClick={() => setSelectedRoomId(2)}
            className="bg-secondary hover:bg-secondary/90 text-white py-4 px-4 rounded-full flex items-center justify-center space-x-2"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm font-medium">General Chat</span>
          </Button>
        </div>

        {/* Direct Messages */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-dark-slate">Direct Messages</h3>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-dark-slate">Start a conversation</h4>
                    <p className="text-sm text-gray-600">Find and message other pet parents or service providers</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentRoom = allRooms.find(room => room.id === selectedRoomId);

  return (
    <div className="flex flex-col h-screen">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedRoomId(null)}
            >
              ←
            </Button>
            <div>
              <h2 className="text-lg font-bold text-dark-slate">{currentRoom?.name}</h2>
              {currentRoom?.description && (
                <p className="text-sm text-gray-600">{currentRoom.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === user?.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-dark-slate'
                }`}
              >
                {message.senderId !== user?.id && (
                  <p className="text-xs font-medium mb-1">
                    {message.sender.firstName} {message.sender.lastName}
                  </p>
                )}
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.senderId === user?.id ? 'text-orange-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.createdAt!)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm">
            <Plus className="h-4 w-4 text-gray-400" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button variant="ghost" size="sm">
            <Mic className="h-4 w-4 text-gray-400" />
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            className="bg-primary hover:bg-primary/90 rounded-full p-2"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
