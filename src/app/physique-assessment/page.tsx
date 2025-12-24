
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Upload,
  User,
  Image as ImageIcon,
  Loader2,
  X,
} from 'lucide-react';
import { getPhysiqueAssessment } from '@/ai/flows/get-physique-assessment';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Markdown } from '@/components/markdown';

function ImageUploader({
  title,
  onFileChange,
  preview,
  onClear,
}: {
  title: string;
  onFileChange: (file: File) => void;
  preview: string | null;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Please upload an image smaller than 5MB.',
        });
        return;
      }
      onFileChange(file);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-center">{title}</h3>
      <Input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      {preview ? (
        <div className="relative group aspect-[3/4]">
          <Image
            src={preview}
            alt={`${title} preview`}
            fill
            className="rounded-md object-contain"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onClear}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear image</span>
          </Button>
        </div>
      ) : (
        <button
          className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg aspect-[3/4] hover:border-primary transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <span className="text-muted-foreground text-sm">
            Click to upload
          </span>
        </button>
      )}
    </div>
  );
}

export default function PhysiqueAssessmentPage() {
  const [frontPhoto, setFrontPhoto] = useState<File | null>(null);
  const [sidePhoto, setSidePhoto] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [sidePreview, setSidePreview] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleFileChange = (
    file: File,
    setter: (f: File) => void,
    previewSetter: (url: string) => void
  ) => {
    setter(file);
    const previewUrl = URL.createObjectURL(file);
    previewSetter(previewUrl);
  };

  const handleClear = (
    fileSetter: (f: null) => void,
    previewSetter: (url: null) => void,
    currentPreview: string | null
  ) => {
    fileSetter(null);
    if (currentPreview) {
      URL.revokeObjectURL(currentPreview);
    }
    previewSetter(null);
  };

  useEffect(() => {
    return () => {
      if (frontPreview) URL.revokeObjectURL(frontPreview);
      if (sidePreview) URL.revokeObjectURL(sidePreview);
    };
  }, [frontPreview, sidePreview]);

  const handleGetAssessment = async () => {
    if (!frontPhoto || !sidePhoto) {
      toast({
        variant: 'destructive',
        title: 'Missing Photos',
        description: 'Please upload both front and side view photos.',
      });
      return;
    }

    setIsLoading(true);
    setAssessment(null);

    try {
      const toBase64 = (file: File) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });

      const [frontPhotoDataUri, sidePhotoDataUri] = await Promise.all([
        toBase64(frontPhoto),
        toBase64(sidePhoto),
      ]);

      const result = await getPhysiqueAssessment({
        frontPhotoDataUri,
        sidePhotoDataUri,
      });
      setAssessment(result.assessment);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: 'Failed to get assessment from AI. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">AI Physique Assessment</CardTitle>
          <CardDescription>
            Upload front and side photos for a qualitative analysis of your
            physique from our AI coach.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Important Considerations</AlertTitle>
            <AlertDescription>
              For best results, use good lighting and a neutral background. Wear
              form-fitting clothing. This tool provides descriptive feedback,
              not medical advice or precise measurements.
            </AlertDescription>
          </Alert>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUploader
              title="Front View"
              preview={frontPreview}
              onFileChange={(file) =>
                handleFileChange(file, setFrontPhoto, setFrontPreview)
              }
              onClear={() => handleClear(setFrontPhoto, setFrontPreview, frontPreview)}
            />
            <ImageUploader
              title="Side View"
              preview={sidePreview}
              onFileChange={(file) =>
                handleFileChange(file, setSidePhoto, setSidePreview)
              }
              onClear={() => handleClear(setSidePhoto, setSidePreview, sidePreview)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleGetAssessment}
            disabled={isLoading || !frontPhoto || !sidePhoto}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Sparkles className="mr-2" />
            )}
            Get AI Assessment
          </Button>
        </CardFooter>
      </Card>
      {isLoading && (
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-16 min-h-[200px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg">Our AI is analyzing your physique...</p>
          <p className="text-sm">This may take a moment.</p>
        </div>
      )}

      {assessment && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Sparkles />
              AI Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Markdown content={assessment} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
