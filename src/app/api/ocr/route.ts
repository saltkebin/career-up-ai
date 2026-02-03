import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルがアップロードされていません' },
        { status: 400 }
      );
    }

    // ファイルをBase64に変換
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    // MIMEタイプを取得
    const mimeType = file.type || 'image/png';

    // Gemini 3 Flash モデルを使用
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // ドキュメントタイプに応じたプロンプトを生成
    const prompt = getPromptForDocumentType(documentType);

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();

    // 抽出されたデータをパース
    const extractedData = parseExtractedData(text, documentType);

    return NextResponse.json({
      success: true,
      rawText: text,
      extractedData,
      documentType,
    });
  } catch (error) {
    console.error('OCR処理エラー:', error);
    return NextResponse.json(
      { error: 'OCR処理中にエラーが発生しました', details: String(error) },
      { status: 500 }
    );
  }
}

function getPromptForDocumentType(documentType: string): string {
  const basePrompt = `この書類から情報を抽出してください。日本語で回答してください。`;

  switch (documentType) {
    case 'salary_ledger':
      return `${basePrompt}
これは賃金台帳です。以下の情報をJSON形式で抽出してください：
- employee_name: 従業員名
- period: 対象期間（年月）
- base_salary: 基本給
- fixed_allowances: 固定的手当（役職手当、資格手当など）の合計
- overtime_pay: 残業代（時間外手当、深夜手当、休日手当）
- commuting_allowance: 通勤手当
- total_payment: 総支給額
- work_days: 出勤日数
- scheduled_work_days: 所定労働日数

抽出できない項目はnullとしてください。`;

    case 'form_3':
      return `${basePrompt}
これはキャリアアップ助成金の様式第3号（支給申請書）です。以下の情報をJSON形式で抽出してください：
- company_name: 事業所名称
- insurance_number: 雇用保険適用事業所番号
- representative_name: 代表者氏名
- worker_name: 対象労働者氏名
- conversion_date: 転換日
- pre_salary_total: 転換前賃金合計
- post_salary_total: 転換後賃金合計
- salary_increase_rate: 賃金上昇率
- application_amount: 申請金額

抽出できない項目はnullとしてください。`;

    case 'employment_contract':
      return `${basePrompt}
これは雇用契約書または労働条件通知書です。以下の情報をJSON形式で抽出してください：
- employee_name: 従業員名
- employment_type: 雇用形態（正社員、契約社員、パート等）
- contract_start_date: 契約開始日
- contract_end_date: 契約終了日（期間の定めなしの場合は"indefinite"）
- base_salary: 基本給
- working_hours: 所定労働時間
- has_bonus: 賞与の有無（true/false）
- has_retirement_benefit: 退職金の有無（true/false）

抽出できない項目はnullとしてください。`;

    default:
      return `${basePrompt}
この書類に記載されている主要な情報をJSON形式で抽出してください。
キーは英語、値は書類に記載されている通りの日本語で出力してください。`;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseExtractedData(text: string, documentType: string): Record<string, unknown> {
  try {
    // JSONブロックを抽出
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    // JSONブロックがない場合、直接パースを試みる
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      return JSON.parse(text.substring(jsonStart, jsonEnd + 1));
    }

    // パースできない場合は生テキストを返す
    return { rawText: text };
  } catch (error) {
    console.error('JSONパースエラー:', error);
    return { rawText: text, parseError: true };
  }
}
