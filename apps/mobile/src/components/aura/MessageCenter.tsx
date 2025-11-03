import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle, Send, Trash2, X } from 'lucide-react-native';
import { Message } from '@aura/shared';

interface MessageCenterProps {
  visible: boolean;
  messages: Message[];
  myName: string;
  partnerName: string;
  onClose: () => void;
  onSend: (content: string, emoji?: string) => void;
  onDelete: (id: string) => void;
}

/**
 * MessageCenter - Local message/note system for the couple
 * Allows leaving caring messages for each other (stored locally)
 */
export default function MessageCenter({
  visible,
  messages,
  myName,
  partnerName,
  onClose,
  onSend,
  onDelete,
}: MessageCenterProps) {
  const [messageText, setMessageText] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState<string | undefined>();
  const scrollViewRef = useRef<ScrollView>(null);

  const emojiOptions = ['💕', '❤️', '🌸', '⭐', '☀️', '🌙', '✨', '🎈'];

  // Log when component receives props
  useEffect(() => {
    console.log('[MessageCenter] Component mounted/updated');
    console.log('[MessageCenter] visible:', visible);
    console.log('[MessageCenter] messages.length:', messages.length);
    console.log('[MessageCenter] messages:', JSON.stringify(messages, null, 2));
  }, [visible, messages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = () => {
    if (!messageText.trim()) return;

    console.log('[MessageCenter] Sending message:', messageText);
    onSend(messageText, selectedEmoji);
    setMessageText('');
    setSelectedEmoji(undefined);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Message', 'Are you sure you want to delete this message?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDelete(id),
      },
    ]);
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalContainer}
            onPress={(e) => e.stopPropagation()}
          >
            <LinearGradient
              colors={['#1e1b4b', '#312e81', '#1e293b']}
              style={styles.modalContent}
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <MessageCircle size={24} color="#06b6d4" />
                  <Text style={styles.title}>Our Messages</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={20} color="rgba(255, 255, 255, 0.8)" />
                </TouchableOpacity>
              </View>

              <Text style={styles.subtitle}>
                記錄你的心情、想法和待辦事項 ✨
              </Text>
              <Text style={styles.description}>
                這是你的私人留言板，所有訊息只儲存在本地手機
              </Text>

              {/* Messages List */}
              <ScrollView
                ref={scrollViewRef}
                style={styles.messagesList}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
              >
                {messages.length === 0 ? (
                  <View style={styles.emptyState}>
                    <MessageCircle size={48} color="rgba(255, 255, 255, 0.3)" />
                    <Text style={styles.emptyText}>No messages yet</Text>
                    <Text style={styles.emptySubtext}>
                      Start the conversation with a caring message!
                    </Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.messageCount}>
                      共 {messages.length} 則訊息
                    </Text>
                    {messages.map((message) => (
                    <View
                      key={message.id}
                      style={[
                        styles.messageItem,
                        message.isFromMe ? styles.myMessage : styles.theirMessage,
                      ]}
                    >
                      <View style={styles.messageBubble}>
                        <View style={styles.messageHeader}>
                          <Text style={styles.messageSender}>
                            {message.isFromMe ? myName : partnerName}
                            {message.emoji && ` ${message.emoji}`}
                          </Text>
                          {message.isFromMe && (
                            <TouchableOpacity
                              onPress={() => handleDelete(message.id)}
                              style={styles.deleteButton}
                            >
                              <Trash2 size={14} color="rgba(255, 255, 255, 0.5)" />
                            </TouchableOpacity>
                          )}
                        </View>
                        <Text style={styles.messageContent}>{message.content}</Text>
                        <Text style={styles.messageTime}>
                          {formatDate(message.createdAt)}
                        </Text>
                      </View>
                    </View>
                  ))}
                  </>
                )}
              </ScrollView>

              {/* Composer */}
              <View style={styles.composer}>
                {/* Emoji Picker */}
                <View style={styles.emojiPicker}>
                  {emojiOptions.map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={[
                        styles.emojiButton,
                        selectedEmoji === emoji && styles.emojiButtonSelected,
                      ]}
                      onPress={() =>
                        setSelectedEmoji(selectedEmoji === emoji ? undefined : emoji)
                      }
                    >
                      <Text style={styles.emojiText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Input Row */}
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    value={messageText}
                    onChangeText={setMessageText}
                    placeholder="Write a message..."
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    maxLength={200}
                    multiline
                  />
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      !messageText.trim() && styles.sendButtonDisabled,
                    ]}
                    onPress={handleSend}
                    disabled={!messageText.trim()}
                  >
                    <Send
                      size={20}
                      color={messageText.trim() ? '#ffffff' : 'rgba(255, 255, 255, 0.3)'}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
    maxHeight: '85%',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  messageCount: {
    fontSize: 11,
    color: 'rgba(6, 182, 212, 0.8)',
    marginBottom: 8,
    fontWeight: '500',
  },
  messagesList: {
    flex: 1,
    maxHeight: 400,
    marginBottom: 16,
  },
  messagesContent: {
    paddingVertical: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 8,
    textAlign: 'center',
  },
  messageItem: {
    marginBottom: 12,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  theirMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
    color: '#06b6d4',
  },
  deleteButton: {
    padding: 4,
  },
  messageContent: {
    fontSize: 15,
    color: '#ffffff',
    lineHeight: 20,
    marginBottom: 6,
  },
  messageTime: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  composer: {
    gap: 12,
  },
  emojiPicker: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  emojiButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emojiButtonSelected: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: '#06b6d4',
  },
  emojiText: {
    fontSize: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#06b6d4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
