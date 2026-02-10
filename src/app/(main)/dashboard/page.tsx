"use client";

import { Check, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

export default function DashboardPage() {
	const [title, setTitle] = useState("");

	const utils = api.useUtils();

	const { data: items, isLoading } = api.item.list.useQuery();

	const createItem = api.item.create.useMutation({
		onSuccess: () => {
			utils.item.list.invalidate();
			setTitle("");
			toast.success("Item created");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const updateItem = api.item.update.useMutation({
		onSuccess: () => {
			utils.item.list.invalidate();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const deleteItem = api.item.delete.useMutation({
		onSuccess: () => {
			utils.item.list.invalidate();
			toast.success("Item deleted");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const handleCreate = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;
		createItem.mutate({ title: title.trim() });
	};

	return (
		<div className="mx-auto max-w-2xl space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
				<p className="text-muted-foreground">Manage your items below.</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Add Item</CardTitle>
					<CardDescription>Create a new item to track.</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleCreate} className="flex gap-2">
						<Input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Enter item title..."
							disabled={createItem.isPending}
						/>
						<Button type="submit" disabled={createItem.isPending || !title.trim()}>
							<Plus className="h-4 w-4" />
							Add
						</Button>
					</form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Items</CardTitle>
					<CardDescription>
						{items ? `${items.length} item${items.length === 1 ? "" : "s"}` : "Loading..."}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="space-y-3">
							{Array.from({ length: 3 }).map((_, i) => (
								<div key={i} className="flex items-center gap-3">
									<Skeleton className="h-8 w-8 rounded" />
									<Skeleton className="h-4 flex-1" />
								</div>
							))}
						</div>
					) : items?.length === 0 ? (
						<p className="py-8 text-center text-sm text-muted-foreground">
							No items yet. Create one above!
						</p>
					) : (
						<ul className="divide-y">
							{items?.map((item) => (
								<li key={item.id} className="flex items-center gap-3 py-3">
									<Button
										variant={item.completed ? "default" : "outline"}
										size="icon"
										className="h-8 w-8 shrink-0"
										onClick={() =>
											updateItem.mutate({
												id: item.id,
												data: { completed: !item.completed },
											})
										}
									>
										{item.completed && <Check className="h-4 w-4" />}
									</Button>
									<span
										className={`flex-1 ${item.completed ? "text-muted-foreground line-through" : ""}`}
									>
										{item.title}
									</span>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
										onClick={() => deleteItem.mutate({ id: item.id })}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</li>
							))}
						</ul>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
