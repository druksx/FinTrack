"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BadgeQuestionMark } from "lucide-react";
import { CATEGORY_ICONS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { apiClient, API_ENDPOINTS } from "@/lib/api";
import { useUser } from "@/lib/UserContext";
import { useRefresh } from "@/lib/RefreshContext";

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryAdded: () => void;
  editCategory?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
}

interface IconInfo {
  name: string;
  icon: (typeof CATEGORY_ICONS)[keyof typeof CATEGORY_ICONS];
}

const allIcons: IconInfo[] = Object.entries(CATEGORY_ICONS).map(
  ([name, icon]) => ({
    name,
    icon,
  })
);

export default function CategoryDialog({
  isOpen,
  onClose,
  onCategoryAdded,
  editCategory,
}: CategoryDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#000000");
  const [selectedIcon, setSelectedIcon] = useState("");
  const [searchIcon, setSearchIcon] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();
  const { refreshAll } = useRefresh();

  useEffect(() => {
    if (editCategory) {
      setName(editCategory.name);
      setColor(editCategory.color);
      setSelectedIcon(editCategory.icon);
    } else {
      setName("");
      setColor("#000000");
      setSelectedIcon("");
    }
  }, [editCategory, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !color || !selectedIcon) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }

    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const categoryData = {
        name,
        color,
        icon: selectedIcon,
      };

      const response = editCategory
        ? await apiClient.put(
            `${API_ENDPOINTS.CATEGORIES}/${editCategory.id}`,
            categoryData,
            user.id
          )
        : await apiClient.post(API_ENDPOINTS.CATEGORIES, categoryData, user.id);

      if (!response.ok) {
        throw new Error(
          editCategory
            ? "Failed to update category"
            : "Failed to create category"
        );
      }

      toast({
        title: editCategory ? "Category updated" : "Category added",
        description: editCategory
          ? `Successfully updated category "${name}"`
          : `Successfully added category "${name}"`,
      });

      onCategoryAdded();
      onClose();
      setName("");
      setColor("#000000");
      setSelectedIcon("");
      setSearchIcon("");
    } catch (error) {
      console.error(
        editCategory ? "Error updating category:" : "Error adding category:",
        error
      );
      toast({
        variant: "destructive",
        title: "Error",
        description: editCategory
          ? "Failed to update category. Please try again."
          : "Failed to add category. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const searchTerm = searchIcon.toLowerCase();
  const filteredIcons = allIcons.filter((icon) =>
    icon.name.toLowerCase().includes(searchTerm)
  );

  const selectedIconComponent = selectedIcon
    ? CATEGORY_ICONS[selectedIcon] || BadgeQuestionMark
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editCategory ? "Edit Category" : "Add New Category"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="flex gap-6">
            <div className="w-1/3 space-y-4">
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Preview
              </div>
              <div className="rounded-xl border p-4 space-y-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: color || "#000000",
                    opacity: selectedIcon ? 1 : 0.5,
                  }}
                >
                  {selectedIconComponent ? (
                    <div className="text-white">
                      {React.createElement(selectedIconComponent, {
                        className: "h-6 w-6",
                      })}
                    </div>
                  ) : (
                    <div className="text-white text-xs text-center">
                      Select an icon
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium">{name || "Category Name"}</div>
                  <div
                    className="text-sm mt-1"
                    style={{ color: color || "#000000" }}
                  >
                    Sample expense
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter a name for your category"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="search">Search Icons</Label>
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search for an icon..."
                    value={searchIcon}
                    onChange={(e) => setSearchIcon(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto rounded-lg border p-2">
                  {filteredIcons.length === 0 ? (
                    <div className="col-span-2 text-center py-4 text-muted-foreground">
                      No icons found for "{searchIcon}"
                    </div>
                  ) : (
                    filteredIcons.map(({ name: iconName, icon: Icon }) => {
                      const isSelected = selectedIcon === iconName;
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => {
                            setSelectedIcon(iconName);
                            if (!name) {
                              setName(
                                iconName.replace(/([A-Z])/g, " $1").trim()
                              );
                            }
                          }}
                          className={`p-2 rounded-lg hover:bg-secondary flex items-center gap-2 transition-colors ${
                            isSelected
                              ? "bg-black text-white hover:bg-black/90"
                              : ""
                          }`}
                          title={iconName}
                        >
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                            style={{ backgroundColor: color }}
                          >
                            {React.createElement(Icon, {
                              className: "h-4 w-4 text-white",
                            })}
                          </div>
                          <span className="flex-1 truncate font-medium">
                            {iconName.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>

                <div>
                  <Label htmlFor="color">Category Color</Label>
                  <div className="flex gap-3 mt-1.5">
                    <Input
                      id="color"
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-20 h-10 p-1 cursor-pointer"
                    />
                    <div
                      className="flex-1 rounded-lg p-2 text-sm"
                      style={{ backgroundColor: `${color}15`, color: color }}
                    >
                      Click the color picker to change
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedIcon}
              className="bg-black text-white hover:bg-black/90"
            >
              {isSubmitting
                ? editCategory
                  ? "Updating..."
                  : "Adding..."
                : editCategory
                ? "Update Category"
                : "Add Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
