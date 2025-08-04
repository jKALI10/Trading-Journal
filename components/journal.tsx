"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Plus, Search, Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface JournalEntry {
  id: number;
  date: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  attachments?: string[];
}

interface JournalProps {
  entries: JournalEntry[];
  onSaveEntry: (
    newEntryData: Omit<JournalEntry, "id" | "date">,
    editingId?: number
  ) => void;
  onDeleteEntry: (id: number) => void;
}

export function Journal({ entries, onSaveEntry, onDeleteEntry }: JournalProps) {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newEntry, setNewEntry] = useState({
    title: "",
    content: "",
    mood: "",
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState("");
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  const filteredEntries = entries.filter(
    (entry) =>
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleSaveEntry = () => {
    if (newEntry.title && newEntry.content) {
      onSaveEntry(newEntry, editingEntry?.id);
      setNewEntry({ title: "", content: "", mood: "", tags: [] });
      setEditingEntry(null);
      setShowForm(false);
    }
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setNewEntry({
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      tags: [...entry.tags],
    });
    setShowForm(true);
  };

  const handleDeleteEntry = (id: number) => {
    onDeleteEntry(id);
  };

  const addTag = () => {
    if (newTag && !newEntry.tags.includes(newTag)) {
      setNewEntry({ ...newEntry, tags: [...newEntry.tags, newTag] });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewEntry({
      ...newEntry,
      tags: newEntry.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "confident":
        return "bg-green-100 text-green-800 border-green-200";
      case "frustrated":
        return "bg-red-100 text-red-800 border-red-200";
      case "reflective":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "excited":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingEntry(null);
    setNewEntry({ title: "", content: "", mood: "", tags: [] });
    setNewTag("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trading Journal</h1>
          <p className="text-muted-foreground">
            Reflect on your trading journey and mindset
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          New Entry
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingEntry ? "Edit Journal Entry" : "New Journal Entry"}
            </CardTitle>
            <CardDescription>
              Reflect on your trading performance and mindset
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Entry title..."
                value={newEntry.title}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Write your thoughts, reflections, and insights..."
                value={newEntry.content}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, content: e.target.value })
                }
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mood">Mood/Sentiment</Label>
              <Input
                id="mood"
                placeholder="confident, frustrated, excited, reflective..."
                value={newEntry.mood}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, mood: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newEntry.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveEntry}>
                {editingEntry ? "Update Entry" : "Save Entry"}
              </Button>
              <Button variant="outline" onClick={handleCancelForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search journal entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredEntries.map((entry) => (
          <Card key={entry.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{entry.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {entry.date}
                    {entry.mood && (
                      <Badge
                        variant="outline"
                        className={getMoodColor(entry.mood)}
                      >
                        {entry.mood}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditEntry(entry)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete Journal Entry
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this journal entry?
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteEntry(entry.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </p>

                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEntries.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm
                ? "No journal entries found matching your search."
                : "No journal entries yet. Start reflecting on your trading journey!"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
