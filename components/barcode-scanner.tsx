"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, X } from "lucide-react"

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  isActive: boolean
  onClose: () => void
}

export function BarcodeScanner({ onScan, isActive, onClose }: BarcodeScannerProps) {
  const [manualInput, setManualInput] = useState("")
  const [isCameraActive, setIsCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Usar câmera traseira
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsCameraActive(true)
      }
    } catch (error) {
      console.error("Erro ao acessar câmera:", error)
      alert("Não foi possível acessar a câmera. Use a entrada manual.")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsCameraActive(false)
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualInput.trim()) {
      onScan(manualInput.trim())
      setManualInput("")
    }
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  if (!isActive) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Scanner de Código de Barras</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Entrada Manual */}
          <form onSubmit={handleManualSubmit} className="space-y-2">
            <Input
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Digite o código de barras"
              autoFocus
            />
            <Button type="submit" className="w-full">
              Confirmar Código
            </Button>
          </form>

          <div className="text-center text-sm text-gray-500">ou</div>

          {/* Scanner de Câmera */}
          {!isCameraActive ? (
            <Button onClick={startCamera} className="w-full bg-transparent" variant="outline">
              <Camera className="h-4 w-4 mr-2" />
              Usar Câmera
            </Button>
          ) : (
            <div className="space-y-2">
              <video ref={videoRef} autoPlay playsInline className="w-full h-48 bg-black rounded" />
              <Button onClick={stopCamera} variant="outline" className="w-full bg-transparent">
                Parar Câmera
              </Button>
              <p className="text-xs text-gray-500 text-center">Posicione o código de barras na frente da câmera</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
